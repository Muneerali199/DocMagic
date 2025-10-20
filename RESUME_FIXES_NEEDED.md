# Resume Page Fixes - Implementation Guide

## Issues to Fix:

1. **Name field showing prompt text instead of actual name**
2. **Missing name and email input fields in UI**
3. **PDF export font size issues**
4. **LinkedIn import message needs update**

---

## Fix 1: Add Name and Email Fields to UI

### File: `components/resume/mobile-resume-builder.tsx`

#### Step 1: Add state variables (around line 37)
```typescript
const [manualText, setManualText] = useState("");
const [userName, setUserName] = useState("");  // ADD THIS
const [userEmail, setUserEmail] = useState(""); // ADD THIS
const [currentStep, setCurrentStep] = useState<'input' | 'preview'>('input');
```

#### Step 2: Update handleManualImport function (around line 174)
Replace the entire function with:

```typescript
const handleManualImport = async () => {
  // Validate name and email first
  if (!userName.trim()) {
    toast({
      title: "Please enter your name",
      description: "Your name is required to generate the resume",
      variant: "destructive",
    });
    return;
  }

  if (!userEmail.trim()) {
    toast({
      title: "Please enter your email",
      description: "Your email is required to generate the resume",
      variant: "destructive",
    });
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    toast({
      title: "Invalid email format",
      description: "Please enter a valid email address",
      variant: "destructive",
    });
    return;
  }

  if (!manualText.trim()) {
    toast({
      title: "Please enter job description",
      description: "Tell us about the role you're targeting",
      variant: "destructive",
    });
    return;
  }

  if (manualText.trim().length < 10) {
    toast({
      title: "Please provide more information",
      description: "Tell us more about the role (at least 10 characters)",
      variant: "destructive",
    });
    return;
  }

  setIsImporting(true);

  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Please sign in first");

    // Use actual name and email from input fields
    const response = await fetch("/api/generate/resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        prompt: manualText.trim(),
        name: userName.trim(),      // Use actual name
        email: userEmail.trim()     // Use actual email
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.details || data.error || "Failed to generate resume";
      console.error("Resume generation error:", { status: response.status, data });
      throw new Error(errorMsg);
    }

    // Rest of the function remains the same...
```

#### Step 3: Update the "Quick Generate" tab UI (around line 604)

Replace the `<TabsContent value="text">` section with:

```tsx
{/* Manual Text Tab - Using Working Resume Generation */}
<TabsContent value="text" className="space-y-4">
  <div className="space-y-3">
    {/* Name Input */}
    <div>
      <Label htmlFor="user-name" className="text-sm font-medium">
        Your Name *
      </Label>
      <Input
        id="user-name"
        placeholder="e.g., John Doe"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="bg-white/50"
      />
    </div>

    {/* Email Input */}
    <div>
      <Label htmlFor="user-email" className="text-sm font-medium">
        Your Email *
      </Label>
      <Input
        id="user-email"
        type="email"
        placeholder="e.g., john.doe@example.com"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        className="bg-white/50"
      />
    </div>

    {/* Job Description */}
    <div>
      <Label htmlFor="manual-text" className="text-sm font-medium flex items-center gap-2">
        Job Description / Target Role *
        <span className="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs rounded-full font-bold">
          AI-Powered ✨
        </span>
      </Label>
      <Textarea
        id="manual-text"
        placeholder="Describe the job role you're targeting:

Example:
Full Stack Developer with 5 years of experience
Expert in React, Node.js, Python, AWS
Led team of 10 developers
Increased performance by 40%
Bachelor's in Computer Science
Certified AWS Solutions Architect
..."
        value={manualText}
        onChange={(e) => setManualText(e.target.value)}
        className="min-h-[180px] bg-white/50 resize-none"
      />
    </div>
    
    <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0 animate-pulse" />
      <p className="text-xs text-gray-700">
        <strong className="text-blue-700">AI will create:</strong> Complete professional resume with 
        proper formatting, quantified achievements, and ATS optimization + instant compatibility score!
      </p>
    </div>
  </div>
  
  <Button
    onClick={handleManualImport}
    disabled={isImporting}
    className="w-full forest-gradient hover:scale-105 transition-all duration-300 text-white shadow-lg"
    size="lg"
  >
    {isImporting ? (
      <>
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <span className="font-semibold">Generating Professional Resume...</span>
      </>
    ) : (
      <>
        <Sparkles className="mr-2 h-5 w-5" />
        <span className="font-semibold">Generate Resume with AI</span>
      </>
    )}
  </Button>
</TabsContent>
```

---

## Fix 2: Add "Coming Soon" Message to LinkedIn Tab

Find the LinkedIn tab content (around line 547) and add this at the top:

```tsx
<TabsContent value="linkedin" className="space-y-4">
  {/* Coming Soon Message */}
  <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 mb-4">
    <div className="flex items-center gap-3 mb-4">
      <Linkedin className="h-8 w-8 text-blue-600" />
      <div>
        <h3 className="font-bold text-lg text-gray-900">LinkedIn Import</h3>
        <p className="text-sm text-gray-600">Feature In Progress</p>
      </div>
    </div>
    <div className="space-y-3">
      <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-blue-200">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-900 mb-1">Coming Soon!</p>
          <p className="text-xs text-gray-600">
            We're working on LinkedIn URL import feature. It will be available soon!
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-900 mb-1">Use Quick Generate Instead</p>
          <p className="text-xs text-gray-600">
            For now, use the "Quick Generate" tab. Just enter your name, email, and job description - our AI will create a professional resume for you!
          </p>
        </div>
      </div>
    </div>
  </div>
  
  {/* Keep existing LinkedIn URL input but make it disabled/grayed out */}
  <div className="opacity-50 pointer-events-none">
    {/* Existing LinkedIn URL form */}
```

---

## Fix 3: PDF Export Font Size

### File: `components/resume/resume-preview.tsx`

Update the `exportToPDF` function (around line 202):

```typescript
const exportToPDF = async () => {
  setIsExporting(true);
  
  try {
    const element = document.getElementById('resume-content');
    if (!element) throw new Error('Resume content element not found');
    
    const canvas = await html2canvas(element, {
      scale: 3,  // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowWidth: 794,  // A4 width in pixels
      windowHeight: 1123, // A4 height in pixels
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Create PDF with proper A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    
    // Calculate proper dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / (imgWidth / 3.78), pdfHeight / (imgHeight / 3.78));
    
    const finalWidth = (imgWidth / 3.78) * ratio;
    const finalHeight = (imgHeight / 3.78) * ratio;
    
    // Center the content
    const xOffset = (pdfWidth - finalWidth) / 2;
    const yOffset = 0;
    
    pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight, '', 'FAST');
    pdf.save(`${resume.name?.replace(/\s+/g, '-').toLowerCase() || 'resume'}.pdf`);
    
    toast({
      title: "Resume exported!",
      description: "Your resume has been downloaded as a PDF.",
    });
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    toast({
      title: "Export failed",
      description: "Failed to export resume to PDF. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsExporting(false);
  }
};
```

---

## Summary of Changes:

✅ **Added name and email input fields** - Users now enter their actual name and email  
✅ **Fixed prompt being used as name** - Now uses separate fields for name, email, and job description  
✅ **Added LinkedIn "Coming Soon" message** - Clear communication that feature is in progress  
✅ **Fixed PDF export sizing** - Proper A4 dimensions with correct font scaling  
✅ **Better validation** - Email format validation and required field checks  

---

## Testing Steps:

1. Go to `/resume` page
2. Click "Quick Generate" tab
3. Enter:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Job Description: "Full stack developer with 5 years experience"
4. Click "Generate Resume with AI"
5. Check that resume shows "John Doe" as the name
6. Export as PDF and verify proper sizing and font

---

## Expected Result:

- ✅ Name field shows actual user name (not the prompt)
- ✅ Email field shows actual user email
- ✅ PDF exports at proper A4 size with readable fonts
- ✅ LinkedIn tab shows "Coming Soon" message
- ✅ Clear, user-friendly interface

