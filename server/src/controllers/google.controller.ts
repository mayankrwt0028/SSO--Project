import { Request, Response } from "express";
import { googleOAuth } from "../../config/google";
import { google } from "googleapis";
import { prisma } from "../../lib/prisma";
import jwt from "jsonwebtoken"

export const googleLogin = (req: Request, res: Response)=>{
  const url = googleOAuth.generateAuthUrl({
    access_type: "offline",
    scope:[
      "openid",
      "email",
      "profile"
    ],
    prompt: "consent"
  })
  res.redirect(url)
}

export const googleCallback = async(req:Request, res:Response)=>{
  try {
    const  {code}= req.query;

    if(!code || typeof code !== "string"){
      return res.status(400).json({
        message: "Authorization code is missing"
      })
    }

    const {tokens} = await googleOAuth.getToken(code)

    googleOAuth.setCredentials(tokens);

    const oauth2 = google.oauth2({
      version: "v2",
      auth: googleOAuth
    })

    const {data} = await oauth2.userinfo.get();

    const googleId = data.id;
    const email = data.email;
    const name = data.name;
    if(!googleId || !email || !name){
      return res.status(400).json({
        message: "Google user information is incomplete"
      })
    }


// try {
//   await prisma.$queryRaw`SELECT 1`;
//   console.log("Database connection: OK");
// } catch (error) {
//   console.log("Database connection: FAILED");
//   console.error(error);
// }
    const exitingUser = await prisma.user.findUnique({
      where:{
        email
      }
    })
let user;

    if(exitingUser){
      if(exitingUser.provider !== "google"){
        return res.redirect(
    "http://localhost:5173/?error=account_exists"
  );
      }
    user = exitingUser

    }else{
       user = await prisma.user.create({
      data:{
        name,
        email,
        provider:"google",
        providerId: googleId
      }
    })
    }
const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
  },
  process.env.JWT_SECRET!,
  { expiresIn: "1d" }

)
   
     res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
     })

  return res.redirect("http://localhost:5173")
  } catch (error:any) {
    console.error("GOOGLE CALLBACK ERROR");
  console.error("name:", error?.name);
  console.error("message:", error?.message);
  console.error("stack:", error?.stack);
  console.error("full error:", error);

  return res.status(500).json({
    message: "Google authentication failed",
  });
  }
}