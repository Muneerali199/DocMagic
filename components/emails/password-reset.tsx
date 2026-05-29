export const PasswordResetEmail = (resetLink: string) => `
<div style="font-family: Arial, sans-serif; padding: 20px; background: #f9fafb;">
  <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 12px;">

    <h1 style="color: #dc2626;">Password Reset</h1>

    <p>You requested a password reset.</p>

    <a
      href="${resetLink}"
      style="
        display:inline-block;
        margin-top:20px;
        background:#dc2626;
        color:white;
        padding:12px 20px;
        border-radius:8px;
        text-decoration:none;
      "
    >
      Reset Password
    </a>

  </div>
</div>
`;