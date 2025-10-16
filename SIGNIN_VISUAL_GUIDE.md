# DocMagic Sign In Page - Visual Guide

## 🎨 New Gamma-Style Design

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                      [DocMagic Logo]                    │
│                                                         │
│     ┌──────────────────────────────────────────┐       │
│     │                                          │       │
│     │            Sign in                       │       │
│     │                                          │       │
│     │  ┌────────────────────────────────────┐ │       │
│     │  │  [G] Continue with Google          │ │       │
│     │  └────────────────────────────────────┘ │       │
│     │                                          │       │
│     │          ─────── or ───────              │       │
│     │                                          │       │
│     │  ┌────────────────────────────────────┐ │       │
│     │  │ Email                              │ │       │
│     │  └────────────────────────────────────┘ │       │
│     │                                          │       │
│     │  ┌────────────────────────────────────┐ │       │
│     │  │ Password                      [👁] │ │       │
│     │  └────────────────────────────────────┘ │       │
│     │                                          │       │
│     │                   Forgot password?       │       │
│     │                                          │       │
│     │  ┌────────────────────────────────────┐ │       │
│     │  │         Sign in                    │ │       │
│     │  └────────────────────────────────────┘ │       │
│     │                                          │       │
│     │  Don't have an account? Sign up          │       │
│     │                                          │       │
│     └──────────────────────────────────────────┘       │
│                                                         │
│         Continue with Single Sign On (SSO)              │
│                                                         │
│                  © 2025 DocMagic                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📐 Layout Specifications

### Page Structure
- **Background:** Cream (#F3E9DC) - full screen
- **Content:** Centered vertically and horizontally
- **Max Width:** 28rem (448px)
- **Padding:** 1rem on mobile, auto on desktop

### Card Dimensions
- **Background:** White
- **Border Radius:** 1rem (16px)
- **Border:** 1px solid #D4A574
- **Shadow:** Large shadow for depth
- **Padding:** 2rem (32px)

### Logo/Brand
- **Position:** Top center, above card
- **Icon Size:** 2rem (32px)
- **Text Size:** 1.5rem (24px)
- **Color:** #211C1C (dark)
- **Spacing:** 2rem margin bottom

### Heading
- **Text:** "Sign in"
- **Size:** 1.875rem (30px)
- **Weight:** Bold (700)
- **Color:** #211C1C
- **Alignment:** Center
- **Spacing:** 2rem margin bottom

### Google Button
- **Width:** 100%
- **Height:** 3.5rem (56px)
- **Border:** 1px solid #D4A574
- **Background:** White
- **Text:** "Continue with Google"
- **Font Size:** 1rem (16px)
- **Icon:** Google SVG logo (multicolor)
- **Hover:** Light gray background

### Divider
- **Style:** Horizontal line with text
- **Text:** "or"
- **Color:** Gray (#9CA3AF)
- **Line Color:** #D4A574

### Input Fields
- **Width:** 100%
- **Height:** 3.5rem (56px)
- **Border:** 1px solid #D4A574
- **Border Radius:** 0.5rem (8px)
- **Padding:** 1rem horizontal
- **Placeholder Color:** Gray
- **Focus:** 2px ring
- **Gap:** 1.25rem between fields

### Password Toggle
- **Position:** Absolute right inside input
- **Icon Size:** 1.25rem (20px)
- **Color:** Gray (#9CA3AF)
- **Hover:** Darker gray

### Forgot Password Link
- **Size:** 0.875rem (14px)
- **Color:** #8B7355
- **Alignment:** Right
- **Hover:** Underline

### Sign In Button
- **Width:** 100%
- **Height:** 3.5rem (56px)
- **Background:** #8B7355
- **Text Color:** White
- **Border Radius:** 0.5rem (8px)
- **Font Size:** 1rem (16px)
- **Font Weight:** 600
- **Hover:** 90% opacity
- **Disabled:** 50% opacity

### Sign Up Link
- **Size:** 0.875rem (14px)
- **Color:** Gray for text, #8B7355 for link
- **Alignment:** Center
- **Spacing:** 2rem margin top

### SSO Link
- **Size:** 0.875rem (14px)
- **Color:** #6B5C4C
- **Alignment:** Center
- **Position:** Below card
- **Spacing:** 1.5rem margin top

### Footer
- **Size:** 0.875rem (14px)
- **Color:** #6B5C4C
- **Alignment:** Center
- **Position:** Bottom
- **Spacing:** 2rem margin top

## 🎨 Color Palette

### Primary Colors
```
Cream Background:    #F3E9DC  ░░░░░░░░
White Card:          #FFFFFF  ████████
Dark Text:           #211C1C  ████████
```

### Accent Colors
```
Primary Brown:       #8B7355  ████████
Light Brown Border:  #D4A574  ░░░░░░░░
Muted Brown Text:    #6B5C4C  ████████
```

### Functional Colors
```
Gray Text:           #6B7280  ████████
Gray Border:         #D1D5DB  ░░░░░░░░
Focus Ring:          #8B7355  ████████ (20% opacity)
```

## 📱 Responsive Breakpoints

### Mobile (< 640px)
- Full width with 1rem padding
- Logo slightly smaller
- Button text readable

### Tablet (640px - 1024px)
- Card max-width maintained
- Centered with auto margins

### Desktop (> 1024px)
- Same as tablet
- Larger hit areas for mouse

## ✨ Interactions

### Hover States
- **Google Button:** Background lightens
- **Links:** Underline appears
- **Password Toggle:** Icon darkens
- **Sign In Button:** Opacity 90%

### Focus States
- **All Inputs:** 2px ring in accent color
- **All Buttons:** 2px ring in accent color
- **All Links:** Outline for accessibility

### Loading States
- **Sign In Button:** Shows spinner + "Signing in..."
- **Disabled:** All form elements disabled
- **Opacity:** Button at 50%

### Error States
- **Toast:** Red notification for errors
- **Success Toast:** Green notification

## 🎯 Design Philosophy

### Minimalism
- Clean, uncluttered interface
- Focus on essential elements
- No decorative elements
- Clear visual hierarchy

### Professional
- Trustworthy appearance
- Consistent branding
- Polished interactions
- Modern typography

### User-Centric
- Clear call-to-actions
- Intuitive form flow
- Helpful error messages
- Fast load times

### Accessible
- High contrast text
- Keyboard navigable
- Screen reader friendly
- Clear focus indicators

---

**Matches:** Gamma.app signin page style
**Theme:** DocMagic cream (#F3E9DC)
**Status:** Production Ready
