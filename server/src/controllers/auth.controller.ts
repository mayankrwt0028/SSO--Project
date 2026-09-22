import { Request, Response } from "express";

import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import {prisma} from "../../lib/prisma"
import { sendPasswordSetupEmail } from "../services/email.service";

const PASSWORD_SETUP_EXPIRY = 24 * 60 * 60 * 1000;

const hashSetupToken = (token : string)=>{
  return crypto 
  .createHash("sha256")
  .update(token)
  .digest("hex")
}

export const signup = async(req: Request, res:Response) =>{
  try {
    const {name, email}= req.body;

    if(!name || !email ){
      return res.status(400).json({
        message:"Name and Email are required"
      })
    }

    const existingUser= await prisma.user.findUnique({
      where:{
        email,
      }
    })
    if(existingUser){
      return res.status(409).json({
        message: "User is already exist with this email"
      })
    }
const setupToken = crypto.randomBytes(32).toString("hex")

const tokenHash = hashSetupToken(setupToken)

const expiresAt = new Date(
  Date.now() + PASSWORD_SETUP_EXPIRY
);

    // const hashedPassword = await bcrypt.hash(password,10);

    const user = await prisma.user.create({
      data:{
        name: name.trim(),
        email: email.trim().toLowerCase(),
        
        provider:"manual",
        passwordSetupTokenHash: tokenHash,
        passwordSetupExpiresAt: expiresAt
      }
    })

    await sendPasswordSetupEmail(
      user.name,
      user.email,
      setupToken
    )

    return res.status(201).json({
      message:"Account created, Please check email to create your password.",
      
    })
  } catch (error) {
     console.error("GET ME ERROR",error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

   
    if (user.provider !== "manual") {
      return res.status(400).json({
        message:
          "An account already exists with this email. Please login using your original login method.",
      });
    }

   
    if (!user.password) {
      return res.status(400).json({
        message:
          "Please create your password using the link sent to your email before logging in.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
     message: error instanceof Error? error.message : "something went wrong"
    });
  }
};

export const getMe = async (req: Request, res:Response) =>{
  try {
    const userId = req.user?.userId

    if(!userId){
      return res.status(401).json({
        message: "Authentication reuired"
      })
    }

    const user = await prisma.user.findUnique({
      where:{
        id:userId
      },
      select:{
        id:true,
        name: true,
        email: true,
        provider: true,
        createdAt:true
      }
    })

    if(!user){
      return res.status(404).json({
        message:"User not found"
      })
    }

    return res.status(200).json({
      user,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: "Something wen wrong"
    })
  }
}

export const logout = (req: Request, res: Response)=>{
  res.clearCookie("token",{
    httpOnly:true,
    secure: process.env.NODE_ENV === "production",
    sameSite:"lax",
  })
  return res.status(200).json({
    message: "Logout successful"
  })
}

export const createPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Password setup information is missing",
      });
    }

    const tokenHash = hashSetupToken(token);

    const user = await prisma.user.findFirst({
      where: {
        passwordSetupTokenHash: tokenHash,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "This password creation link is invalid",
      });
    }

    if (
      !user.passwordSetupExpiresAt ||
      user.passwordSetupExpiresAt < new Date()
    ) {
      return res.status(400).json({
        message:
          "This password creation link has expired. Please create a new account setup link.",
      });
    }

    if (user.password) {
      return res.status(400).json({
        message: "Password has already been created for this account",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,

        // Single-use token
        passwordSetupTokenHash: null,
        passwordSetupExpiresAt: null,
      },
    });

    return res.status(200).json({
      message:
        "Password created successfully. You can now login.",
    });
  } catch (error) {
    console.error("CREATE PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Unable to create password",
    });
  }
};