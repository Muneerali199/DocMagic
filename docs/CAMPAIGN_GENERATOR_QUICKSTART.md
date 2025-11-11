# 🚀 Quick Setup: AI Campaign Generator

## Get Started in 3 Minutes

### Step 1: Get FREE Groq API Key (1 min)

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up with Google/GitHub (free)
3. Go to "API Keys" section
4. Click "Create API Key"
5. Copy the key (starts with `gsk_...`)

### Step 2: Add to Environment (30 sec)

Open your `.env` file and add:

```bash
GROQ_API_KEY=gsk_your_actual_key_here
```

### Step 3: Restart Dev Server (30 sec)

```bash
npm run dev
```

### Step 4: Test the Feature (1 min)

1. Go to: `http://localhost:3001/campaign`
2. Enter any website URL (try: `https://stripe.com`)
3. Click "Extract DNA"
4. Enter campaign goal: "Launch new payment product"
5. Click "Generate 5 Campaign Ideas"
6. View AI-generated posts for all platforms!

## ✅ That's It!

You now have a fully functional AI Marketing Campaign Generator that:
- Extracts brand DNA from any website
- Generates 5 unique campaign ideas
- Creates 20 platform-specific social media posts
- Provides AI image generation prompts
- All powered by FREE Groq AI

## 📖 Full Documentation

See [CAMPAIGN_GENERATOR_GUIDE.md](./CAMPAIGN_GENERATOR_GUIDE.md) for:
- Complete feature list
- API documentation
- Advanced usage
- Troubleshooting
- Platform optimizations

## 🎯 Example URLs to Try

Test with these well-designed brand websites:
- `https://stripe.com` - FinTech
- `https://airbnb.com` - Travel
- `https://notion.so` - Productivity
- `https://shopify.com` - E-commerce
- `https://figma.com` - Design
- `https://vercel.com` - Developer tools

## 💡 Pro Tips

1. **Use homepage URLs** for best brand DNA extraction
2. **Be specific in goals** - more detail = better campaigns
3. **Try multiple goals** - generate different campaign sets
4. **Customize posts** - AI gives you a starting point
5. **Save your favorites** - copy best posts before regenerating

## 🆘 Need Help?

**Issue:** "Failed to extract brand"
**Fix:** Try the website's homepage URL or a different site

**Issue:** "Failed to generate campaign"
**Fix:** Check GROQ_API_KEY is set correctly in `.env`

**Issue:** Posts look generic
**Fix:** Add more details to your campaign goal

---

**Ready to generate amazing marketing campaigns? Let's go! 🎉**
