import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import {
  sendPasswordSetupEmail,
} from "../services/email.service";

// const PASSWORD_SETUP_EXPIRY = 24 * 60 * 60 * 1000;
 
const PASSWORD_SETUP_EXPIRY = 60 * 1000;

const hashSetupToken = (token: string) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};


export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        password: true,
        passwordSetupExpiresAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const now = new Date();

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider,

      passwordCreated: !!user.password,

      setupExpired:
        !user.password &&
        !!user.passwordSetupExpiresAt &&
        user.passwordSetupExpiresAt < now,

      passwordSetupExpiresAt: user.passwordSetupExpiresAt,

      createdAt: user.createdAt,
    }));

    return res.status(200).json({
      users: formattedUsers,
    });

  } catch (error) {
    console.error("GET ADMIN USERS ERROR:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};



export const resendPasswordSetup = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = Number(req.params.id);

    if (!userId) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.provider !== "manual") {
      return res.status(400).json({
        message: "Password setup is only available for manual users",
      });
    }


    if (user.password) {
      return res.status(400).json({
        message: "User has already created a password",
      });
    }

  
    const setupToken = crypto
      .randomBytes(32)
      .toString("hex");

    const tokenHash = hashSetupToken(setupToken);

    const expiresAt = new Date(
      Date.now() + PASSWORD_SETUP_EXPIRY
    );

    // Save new token
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordSetupTokenHash: tokenHash,
        passwordSetupExpiresAt: expiresAt,
      },
    });

   
    await sendPasswordSetupEmail(
      user.name,
      user.email,
      setupToken
    );

    return res.status(200).json({
      message: "New password setup link sent successfully",
    });

  } catch (error) {
    console.error(
      "RESEND PASSWORD SETUP ERROR:",
      error
    );

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};