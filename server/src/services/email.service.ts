import { BrevoClient } from "@getbrevo/brevo";

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

export const sendPasswordSetupEmail = async (
  name: string,
  email: string,
  token: string
) => {
  const passwordLink =
    `${CLIENT_URL}/create-password?token=${encodeURIComponent(token)}`;

  const loginLink = `${CLIENT_URL}/`;

  try {
    const response = await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: "SSO App",
        email: process.env.EMAIL_FROM!,
      },

      to: [
        {
          email,
          name,
        },
      ],

      subject: "Complete your SSO account setup",

      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          
          <h2>Welcome ${name}!</h2>

          <p>
            Your account has been created successfully.
          </p>

          <p>
            Please create a password to complete your account setup.
          </p>

          <div style="margin: 30px 0;">
            <a
              href="${passwordLink}"
              style="
                background: #000;
                color: #fff;
                padding: 12px 20px;
                text-decoration: none;
                border-radius: 6px;
                display: inline-block;
              "
            >
              Create Password
            </a>
          </div>

          <p>
            This password setup link is valid for <strong>24 hours</strong>.
          </p>

          <p>
            Already created your password?
          </p>

          <a href="${loginLink}">
            Login
          </a>

          <p style="margin-top: 30px; color: #666;">
            If you did not create this account, you can safely ignore this email.
          </p>

        </div>
      `,
    });

    console.log("Password setup email sent:", response);
  } catch (error) {
    console.error("Brevo email sending failed:", error);

    throw new Error("Unable to send account setup email");
  }
};