# 🚀 Quick Setup Guide - Resume Generation Fix

## ⚡ Immediate Action Required

### 1. Set Up Gemini API Key (REQUIRED)

**Get Your Free API Key:**
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the generated key

**Add to Environment:**
Create or edit `.env.local` file in your project root:

```bash
# Add this line (use the key you just created)
GEMINI_API_KEY=your_actual_api_key_here

# OR alternatively, you can use:
GOOGLE_API_KEY=your_actual_api_key_here
```

**Verify Setup:**
```powershell
# In PowerShell, run:
$env:GEMINI_API_KEY
# Should output your API key
```

### 2. Restart Development Server

```powershell
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ Test Resume Generation

### Test Input Examples:

**Simple Test:**
```
Software engineer with 3 years experience in Python and React
```

**Detailed Test:**
```
Senior Full Stack Developer with 5 years at Google, led team of 10, 
increased performance by 40%, expert in Node.js, React, AWS, Docker
```

**Expected Result:**
- ✅ Resume generates successfully
- ✅ ATS Score: 85%+ (Grade A)
- ✅ Contains quantified achievements
- ✅ Professional formatting

## 🎯 Getting Best Results (85%+ ATS Score)

### Include These in Your Input:

1. **Job Title & Experience**
   - "Senior Developer with 5 years"
   - "Marketing Manager with 3+ years"

2. **Quantifiable Achievements**
   - "Increased revenue by 40%"
   - "Managed team of 10"
   - "Improved performance by 2x"

3. **Technical Skills**
   - "Expert in Python, React, AWS"
   - "Proficient in Photoshop, Figma"

4. **Company Names (Optional)**
   - "Worked at Google, Microsoft"
   - "Led projects at Amazon"

5. **Education (Optional)**
   - "Computer Science degree from Stanford"
   - "MBA from Harvard"

### ✅ Good Examples:

**Example 1 - Tech Role:**
```
Senior Software Engineer with 6 years experience. 
Led team of 8 developers building scalable web apps. 
Increased system performance by 60%. 
Expert in JavaScript, React, Node.js, AWS, Docker. 
CS degree from MIT.
```
**Expected Score:** 90-95% (A+ Grade)

**Example 2 - Business Role:**
```
Product Manager with 5 years at Amazon. 
Launched 3 products generating $10M revenue. 
Managed cross-functional team of 15. 
Expert in Agile, Jira, Analytics, Stakeholder Management. 
MBA from Wharton.
```
**Expected Score:** 90-95% (A+ Grade)

**Example 3 - Career Changer:**
```
Transitioning from teaching to software development. 
Completed coding bootcamp with 4.0 GPA. 
Built 3 full-stack projects using React, Node.js, MongoDB. 
Strong communication and problem-solving skills.
```
**Expected Score:** 80-85% (B+ Grade)

## 🐛 Troubleshooting

### Error: "Failed to generate resume"

**1. Check API Key:**
```powershell
# In PowerShell:
$env:GEMINI_API_KEY
# Should show your key, not empty
```

**2. Verify .env.local File:**
- File must be in project root (same folder as `package.json`)
- File name must be exactly `.env.local` (note the dot at start)
- No spaces around the `=` sign

**3. Check Server Logs:**
- Look for messages with emojis: 🚀 📤 ✅ ❌
- Error messages will be specific and actionable

### Error: "API quota exceeded"

**Solution:**
- Free tier limit: 60 requests per minute
- Wait 1 minute and try again
- Or upgrade to paid tier at Google AI Studio

### Low ATS Score (< 85%)

**Check:**
- Did you include job title and years of experience?
- Did you mention specific achievements with numbers?
- Did you list technical skills?
- Review the "Improvements" section in the ATS score breakdown

## 📊 Understanding Your ATS Score

### Scoring Breakdown (100 points total):

| Section | Points | How to Maximize |
|---------|--------|----------------|
| **Contact Info** | 20 | Name, email, phone, location |
| **Professional Summary** | 15 | Write 3-4 sentences (200+ chars) |
| **Work Experience** | 30 | 2+ jobs, 3+ metrics, 4+ bullets each |
| **Education** | 15 | Degree + GPA (if 3.5+) |
| **Skills** | 10 | List 10-15 relevant skills |
| **Projects & Certs** | 10 | 1-2 projects, 1-2 certifications |

### Grade Scale:

- **90-100 (A+/A):** 🟢 Excellent - Fully ATS-optimized
- **80-89 (B+/B):** 🔵 Very Good - Minor improvements
- **70-79 (C+/C):** 🟡 Decent - Needs work
- **< 70 (D/F):** 🔴 Needs major improvements

## 💡 Pro Tips

1. **Use Action Verbs:**
   - Led, Developed, Implemented, Optimized
   - Increased, Reduced, Improved, Managed

2. **Add Numbers:**
   - "40% increase", "$2M budget", "50K+ users"
   - Team size, years of experience, metrics

3. **Be Specific:**
   - Instead of "developer" → "Senior Full Stack Developer"
   - Instead of "worked on projects" → "Led team of 10 to deliver $5M project"

4. **Include Keywords:**
   - Technical: Python, React, AWS, Docker
   - Soft: Leadership, Communication, Problem-solving

5. **Show Impact:**
   - What did you achieve?
   - How did you improve things?
   - What results did you deliver?

## 📝 Quick Reference

### Minimum for Grade A (85%+):
- ✅ Full contact info (name, email, phone, location)
- ✅ 100+ char summary
- ✅ 2+ work experiences
- ✅ 3+ quantified achievements
- ✅ 10+ skills
- ✅ 1+ project or certification

### Perfect Score (95%+):
- ✅ All of the above
- ✅ 3+ work experiences
- ✅ 5+ quantified achievements
- ✅ 15+ skills
- ✅ 2+ projects and certifications
- ✅ GPA 3.5+ or honors

## 🎉 You're All Set!

If you followed these steps:
- ✅ Gemini API key is set up
- ✅ Server is restarted
- ✅ You know how to write good input

You should now be able to generate **Grade A resumes with 85%+ ATS scores**! 🚀

---

**Need Help?**
- Check console logs for detailed error messages
- Review RESUME_GENERATION_ENHANCED.md for full documentation
- Ensure your input includes specific details and achievements

**Test Now:**
1. Go to Resume Builder page
2. Enter detailed input (job title + experience + skills + achievements)
3. Click Generate
4. Check your ATS score!

Target: **85%+ Score (Grade A)** ✨
