import { Request, Response } from "express";

import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import {prisma} from "../../lib/prisma"

export const signup = async(req: Request, res:Response) =>{
  try {
    const {name, email, password}= req.body;

    if(!name || !email || !password){
      return res.status(400).json({
        message:"Name, email and password are required"
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

    const hashedPassword = await bcrypt.hash(password,10);

    const user = await prisma.user.create({
      data:{
        name,
        email,
        password: hashedPassword,
        provider:"manual"
      }
    })

    return res.status(201).json({
      message:"User registered succesfully",
      user:{
        id:user.id,
        name:user.name,
        email:user.email,
        provider: user.provider
      }
    })
  } catch (error) {
     console.error("GET ME ERROR",error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export const login= async(req:Request, res:Response)=>{
  try {
    const {email, password} = req.body
   
     if(!email || !password){
      return res.status(400).json({
        message: "Email and password are required"
      })
     }

     const user = await prisma.user.findUnique({
      where:{
        email
      }
     })

     if(!user){
      return res.status(401).json({
        message: "Invalid email or password"
      })
     }

     if(user.provider !== "manual" || !user.password){
      return res.status(400).json({
        message: "An account already exists with this email. Please login using your original login method."
      })
     }

     const isPasswordValid = await bcrypt.compare(
      password, 
      user.password,
     )

     if(!isPasswordValid){
      return res.status(401).json({
        message:"Invalid email and password"
      })
     }

     const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
     )

     res.cookie("token", token, {
      httpOnly:true,
      secure:process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
     })

     return res.status(200).json({
      message: "Login successful",
      user:{
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider
      }
     })

  } catch (error) {
    console.log("login error ", error)

    return res.status(500).json({
      message:"Something went wrong"
    })
    
  }
}

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