# 🪟 DocMagic Windows Setup Guide: From Download to Localhost

This document helps Windows users set up the DocMagic development environment with clear, native instructions.

 ---

## 📦 Step 1: Install Essential Tools

### 🔧 Node.js
- Recommended: Node.js ≥ 18.x
- Download from [nodejs.org](https://nodejs.org/)
- ✅ Ensure “Add to PATH” is checked during install

### 🔧 Git
- Recommended: Git ≥ 2.40.x
- Download from [git-scm.com](https://git-scm.com/)
- ✅ Check “Add Git to PATH” if prompted

 ---

## 🛠️ Step 2: Set Environment Variables

1. Press `Win + S` → search **“Environment Variables”** → open **“Edit the system environment variables.”**
2. In **System Properties → Advanced → Environment Variables:**
   - Click **New (System variables)**:
     - Name: `NODE_ENV`
     - Value: `development`
   - Ensure `Path` variable includes locations for `Node.js`, `npm`, and `Git`

 ---

## 📁 Step 3: Clone the Repository

In **PowerShell** or **Command Prompt**, run:

```bash
git clone https://github.com/Muneerali199/DocMagic.git
cd DocMagic

```
 ---

## 📥 Step 4: Install Dependencies
Inside the cloned folder:
```
npm install
```
This installs all required packages from ```package.json```

 ---

## 🚀 Step 5: Run the Development Server
Once installation is complete, launch the app with:
```
npm run dev
```

Your local server will be running at:
```
http://localhost:3000
```
You should see DocMagic in action! ✨

 ---

## ⚠️ Step 6: Troubleshooting Tips (Windows-specific)

Common issues Windows users may encounter during setup — with their solutions:

| Problem                        | Fix                                                                 |
|-------------------------------|----------------------------------------------------------------------|
| **Long path errors**          | Enable long paths via Registry Editor:<br>`Computer\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem`<br>→ Set `LongPathsEnabled = 1` |
| **Permission errors**         | Run PowerShell or Command Prompt as Administrator |
| **UTF-8 encoding issues**     | Use command: `chcp 65001` to ensure UTF-8 encoding |
| **Git line-ending warnings**  | Run: `git config --global core.autocrlf input` to normalize line endings |
| **Windows Defender interference** | Add your project folder to the exclusion list in Windows Security |

> 💡 Tip: Restart your terminal after changes to environment variables or permissions.

 ---

## ✅ Step 7: Verify Setup
Make sure:
- The app launches with no errors in the console
- You can see the UI in your browser at http://localhost:3000
- All commands use Windows-native paths and terminals (PowerShell or Command Prompt)


 ---

## 🔮 DocMagic Activated — You're All Set!

Welcome to the DocMagic community! With your Windows setup complete, the spell is cast and your environment is live. Whether you're crafting elegant documentation, building features, or solving bugs, your contribution helps keep the magic flowing.

> 🌟 **Every edit matters, every insight counts — so let’s build something enchanting, together.**

✨ Happy contributing!
