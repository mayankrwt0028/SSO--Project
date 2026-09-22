import { Request, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";

import { githubOAuthConfig } from '../../config/github.auth';
import { prisma } from "../../lib/prisma.js";

export const githubLogin = (req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: githubOAuthConfig.clientId,
    redirect_uri: githubOAuthConfig.callbackUrl,
    scope: "read:user user:email",
  });

  const githubUrl =
    `https://github.com/login/oauth/authorize?${params.toString()}`;

  res.redirect(githubUrl);
};

export const githubCallback = async (
  req: Request,
  res: Response
) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        message: "GitHub authorization code is missing",
      });
    }

  
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: githubOAuthConfig.clientId,
        client_secret: githubOAuthConfig.clientSecret,
        code,
        redirect_uri: githubOAuthConfig.callbackUrl,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).json({
        message: "GitHub access token not received",
      });
    }


    const githubUserResponse = await axios.get(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const githubUser = githubUserResponse.data;


    const githubEmailResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const emails = githubEmailResponse.data;

    const primaryEmail = emails.find(
      (email: any) => email.primary && email.verified
    );

    if (!primaryEmail) {
      return res.status(400).json({
        message: "Verified GitHub email not found",
      });
    }

    const email = primaryEmail.email;
    const githubId = String(githubUser.id);
    const name = githubUser.name || githubUser.login;


    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    let user;

    if (existingUser) {
   
      if (existingUser.provider !== "github") {
        return res.redirect(
  "http://localhost:5173/?error=account_exists"
);
      }

      user = existingUser;
    } else {
      
      user = await prisma.user.create({
        data: {
          name,
          email,
          provider: "github",
          providerId: githubId,
        },
      });
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
    );

    
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

   return res.redirect("http://localhost:5173");
  } catch (error: any) {
    console.error("GITHUB CALLBACK ERROR");
  console.error("name:", error?.name);
  console.error("message:", error?.message);
  console.error("stack:", error?.stack);
  console.error("full error:", error);

  return res.status(500).json({
    message: "GitHub authentication failed",
  });
  }
};