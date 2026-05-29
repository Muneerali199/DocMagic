export const WelcomeEmail = (name: string) => `
<div style="font-family: Arial, sans-serif; padding: 20px; background: #f9fafb;">
  <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 12px;">
    
    <h1 style="color: #4f46e5;">Welcome to DraftDeckAI</h1>

    <p>Hello ${name},</p>

    <p>
      Thanks for joining DraftDeckAI. Start creating resumes,
      presentations, and documents powered by AI.
    </p>

    <a
      href="https://draftdeckai.com"
      style="
        display:inline-block;
        margin-top:20px;
        background:#4f46e5;
        color:white;
        padding:12px 20px;
        border-radius:8px;
        text-decoration:none;
      "
    >
      Start Creating
    </a>

  </div>
</div>
`;