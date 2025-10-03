import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: "Greystar Trust Fund <greystartrustfunds@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || undefined,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

// Email templates
export const emailTemplates = {
  welcome: (userName) => ({
    subject: "Welcome to Greystar Trust Fund!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #1e293b; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: #f97316; margin: 0 0 20px 0;">Welcome to Greystar Trust Fund</h1>
          <p style="color: #ffffff; font-size: 18px; margin: 0 0 20px 0;">Hello ${userName},</p>
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6;">
            Thank you for joining Greystar Trust Fund! Your account has been successfully created.
          </p>
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6;">
            You can now start exploring our investment opportunities and grow your wealth with us.
          </p>
          <div style="margin: 30px 0;">
            <a href="${
              process.env.FRONTEND_URL || "https://greystartrustfund.vercel.app"
            }" 
               style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Access Your Dashboard
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">
            Best regards,<br>
            The Greystar Trust Fund Team
          </p>
        </div>
      </div>
    `,
    message: `Welcome to Greystar Trust Fund!\n\nHello ${userName},\n\nThank you for joining Greystar Trust Fund! Your account has been successfully created.\n\nYou can now start exploring our investment opportunities and grow your wealth with us.\n\nBest regards,\nThe Greystar Trust Fund Team`,
  }),

  transactionUpdate: (
    userName,
    transactionType,
    amount,
    status,
    details = ""
  ) => ({
    subject: `Transaction ${
      status.charAt(0).toUpperCase() + status.slice(1)
    } - ${transactionType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #1e293b; padding: 30px; border-radius: 10px;">
          <h1 style="color: #f97316; margin: 0 0 20px 0;">Transaction Update</h1>
          <p style="color: #ffffff; font-size: 18px; margin: 0 0 20px 0;">Hello ${userName},</p>
          <div style="background-color: #334155; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #e2e8f0; margin: 0 0 10px 0;"><strong>Transaction Type:</strong> ${transactionType}</p>
            <p style="color: #e2e8f0; margin: 0 0 10px 0;"><strong>Amount:</strong> $${amount}</p>
            <p style="color: #e2e8f0; margin: 0 0 10px 0;"><strong>Status:</strong> 
              <span style="color: ${
                status === "confirmed"
                  ? "#10b981"
                  : status === "failed"
                  ? "#ef4444"
                  : "#f59e0b"
              };">
                ${status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </p>
            ${
              details
                ? `<p style="color: #e2e8f0; margin: 0;"><strong>Details:</strong> ${details}</p>`
                : ""
            }
          </div>
          <p style="color: #94a3b8; font-size: 14px; margin: 20px 0 0 0;">
            Best regards,<br>
            The Greystar Trust Fund Team
          </p>
        </div>
      </div>
    `,
    message: `Transaction Update\n\nHello ${userName},\n\nTransaction Type: ${transactionType}\nAmount: $${amount}\nStatus: ${status}\n${
      details ? `Details: ${details}\n` : ""
    }\nBest regards,\nThe Greystar Trust Fund Team`,
  }),

  profitPayment: (userName, amount, planName) => ({
    subject: "Profit Payment Received!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #1e293b; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: #10b981; margin: 0 0 20px 0;">🎉 Profit Payment Received!</h1>
          <p style="color: #ffffff; font-size: 18px; margin: 0 0 20px 0;">Hello ${userName},</p>
          <div style="background-color: #065f46; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">$${amount}</p>
            <p style="color: #d1fae5; margin: 0;">has been added to your account</p>
            <p style="color: #a7f3d0; font-size: 14px; margin: 10px 0 0 0;">From your ${planName} investment</p>
          </div>
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6;">
            Your investment is performing well! Keep growing your wealth with Greystar Trust Fund.
          </p>
          <p style="color: #94a3b8; font-size: 14px; margin: 20px 0 0 0;">
            Best regards,<br>
            The Greystar Trust Fund Team
          </p>
        </div>
      </div>
    `,
    message: `Profit Payment Received!\n\nHello ${userName},\n\n$${amount} has been added to your account from your ${planName} investment.\n\nYour investment is performing well! Keep growing your wealth with Greystar Trust Fund.\n\nBest regards,\nThe Greystar Trust Fund Team`,
  }),

  adminAction: (userName, action, amount, reason) => ({
    subject: `Account Update: ${action}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #1e293b; padding: 30px; border-radius: 10px;">
          <h1 style="color: #f97316; margin: 0 0 20px 0;">Account Update</h1>
          <p style="color: #ffffff; font-size: 18px; margin: 0 0 20px 0;">Hello ${userName},</p>
          <div style="background-color: #334155; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #e2e8f0; margin: 0 0 10px 0;"><strong>Action:</strong> ${action}</p>
            <p style="color: #e2e8f0; margin: 0 0 10px 0;"><strong>Amount:</strong> $${amount}</p>
            <p style="color: #e2e8f0; margin: 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6;">
            This adjustment has been applied to your account by our administrative team.
          </p>
          <p style="color: #94a3b8; font-size: 14px; margin: 20px 0 0 0;">
            Best regards,<br>
            The Greystar Trust Fund Team
          </p>
        </div>
      </div>
    `,
    message: `Account Update\n\nHello ${userName},\n\nAction: ${action}\nAmount: $${amount}\nReason: ${reason}\n\nThis adjustment has been applied to your account by our administrative team.\n\nBest regards,\nThe Greystar Trust Fund Team`,
  }),

  withdrawalRequest: (userName, amount, method) => ({
    subject: "Withdrawal Request Received",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #1e293b; padding: 30px; border-radius: 10px;">
          <h1 style="color: #f97316; margin: 0 0 20px 0;">Withdrawal Request Received</h1>
          <p style="color: #ffffff; font-size: 18px; margin: 0 0 20px 0;">Hello ${userName},</p>
          <div style="background-color: #334155; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #e2e8f0; margin: 0 0 10px 0;"><strong>Amount:</strong> $${amount}</p>
            <p style="color: #e2e8f0; margin: 0 0 10px 0;"><strong>Method:</strong> ${method}</p>
            <p style="color: #e2e8f0; margin: 0;"><strong>Status:</strong> <span style="color: #f59e0b;">Pending Review</span></p>
          </div>
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6;">
            Your withdrawal request has been received and is currently being processed by our team. 
            You will receive another email once the withdrawal has been approved and processed.
          </p>
          <p style="color: #94a3b8; font-size: 14px; margin: 20px 0 0 0;">
            Best regards,<br>
            The Greystar Trust Fund Team
          </p>
        </div>
      </div>
    `,
    message: `Withdrawal Request Received\n\nHello ${userName},\n\nAmount: $${amount}\nMethod: ${method}\nStatus: Pending Review\n\nYour withdrawal request has been received and is currently being processed by our team. You will receive another email once the withdrawal has been approved and processed.\n\nBest regards,\nThe Greystar Trust Fund Team`,
  }),
};

export default sendEmail;
