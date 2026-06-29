export const verificationEmailTemplate = (verificationCode, username) => {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
    .container { max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
    .header { background: #4f46e5; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; }
    .body { padding: 32px; text-align: center; }
    .body p { color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;}
    .code-box { display: inline-block; background: #f3f4f6; border: 2px dashed #4f46e5; border-radius: 8px; padding: 16px 32px; margin: 16px 0; }
    .code { color: #4f46e5; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: 'Courier New', monospace; }
    .footer { padding: 20px 32px; background: #f9fafb; text-align: center; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
    .warning { color: #ef4444; font-size: 13px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Verify Your Email</h1></div>
    <div class="body">
      <p>Hello, ${username}</p>
      <p>Thank you for signing up! Use the verification code below to complete your registration.</p>
      <div class="code-box"><div class="code">${verificationCode}</div></div>
      <p class="warning">This code expires in 5 minutes. Do not share it with anyone.</p>
    </div>
    <div class="footer">
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>Cybaem Tech Team</p>
    </div>
  </div>
</body>
</html>`;
};
