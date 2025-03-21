# Creating and Installing a VSIX Extension in Visual Studio Code

This guide walks you through how to package a Visual Studio Code extension into a `.vsix` file and install it manually.

---

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- [VS Code Extension CLI (`vsce`)](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#packaging-extensions) installed:
  
  ```bash
  npm install -g vsce
  ```

- The extension project folder should contain a valid `package.json`.

---

## Step 1: Package the Extension

In the extension's root folder, run the custom script:

```bash
npm run package
```

This will generate a `.vsix` file in the **root of the project**, typically named like:

```
your-extension-name-x.y.z.vsix
```

---

## Step 2: Install the VSIX in Visual Studio Code

You can install the `.vsix` file using either the **command palette** or the **Extensions tab**.

### Option A: Using the Command Palette

1. Open **Visual Studio Code**
2. Press `Ctrl+Shift+P` (or `F1`)
3. Type: `Extensions: Install from VSIX...`
4. Select your `.vsix` file from the file dialog

### Option B: Using the Extensions Tab

1. Open the **Extensions** sidebar (`Ctrl+Shift+X`)
2. Click the `⋯` (More Actions) menu in the top-right corner
3. Select **Install from VSIX...**
4. Choose your `.vsix` file from the file dialog

---

## Step 3: Verify Installation

1. Go to the **Extensions** sidebar (`Ctrl+Shift+X`)
2. Look for your extension in the list
3. Reload or restart VS Code if necessary

---

## Step 4: Additional Setup (Post-Installation)

After installing the extension, you’ll need to **either**:

- Run the following script from the root of the project:
  
  ```bash
  npm run postinstall_with_git_bash
  ```

  This performs necessary setup tasks that would normally happen automatically when installing from the marketplace.

**OR**

- Manually configure the extension by:
  1. Opening **Extension Settings**
  2. Setting the **Engine Folder Path** to point to the root directory of a compiled backend

> The second option is intended for advanced users or developers who wish to link the extension to a specific backend manually.