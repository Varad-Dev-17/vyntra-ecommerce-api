import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env"), override: true });

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
    pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,
  },
});

async function testMail() {
  try {
    let info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: "varadmule17@gmail.com",
      subject: "Test Email from Vyntra API",
      html: "<p>This is a test email to verify nodemailer configuration.</p>",
    });
    console.log("Email sent successfully!", info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

testMail();
