> ### 🚩 Notice  
> This is a **Service Well AB maintained fork** of the [original Microsoft FHIR Converter VS Code Extension](https://github.com/microsoft/vscode-azurehealthcareapis-tools).  
> All modifications in this repository are made by **Service Well AB** and are licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).  
> This fork includes additional functionality and tools that may not be compatible with the upstream version.  
> For questions, contributions, or support, please contact us via GitHub or reach out directly to Service Well AB.

<br/>

# Developer Guide – Creating and Installing a VSIX Extension in Visual Studio Code

This guide walks you through packaging the extension into a `.vsix` and installing it manually.

---

## Prerequisites

- Node.js 20+ (npm 10+)
- Git Bash available at `C:\Program Files\Git\bin\bash.exe` (Windows)
- Optional: `vsce` globally; otherwise we use `npx @vscode/vsce`

---

## Step 1: Install dependencies

```bash
npm install --ignore-scripts
npm run postinstall_with_git_bash
```

---

## Step 2: Build and bundle

```bash
npm run compile
npm run bundle
```

---

## Step 3: Package the VSIX

```bash
npm run package
```

This generates a `.vsix` in the repo root, e.g.:

```
your-extension-name-x.y.z.vsix
```

---

## Step 4: Install the VSIX in VS Code

You can install the `.vsix` file using either the **Command Palette** or the **Extensions** view.

### Option A: Command Palette

1. Open **Visual Studio Code**
2. Press `Ctrl+Shift+P` (or `F1`)
3. Type: `Extensions: Install from VSIX...`
4. Select your `.vsix` file

### Option B: Extensions view

1. Open the **Extensions** sidebar (`Ctrl+Shift+X`)
2. Click the `⋯` (More Actions) menu in the top-right corner
3. Select **Install from VSIX...**
4. Choose your `.vsix` file

---

## Step 5: Verify installation

1. Open the **Extensions** sidebar (`Ctrl+Shift+X`)
2. Find the extension in the list
3. Reload or restart VS Code if needed

---

## Notes

- `npm run package` calls `vsce` via `npx` and assumes `npm run bundle` has produced `dist/`.
- If Git Bash lives elsewhere, update `postinstall_with_git_bash` in `package.json`.
- The postinstall script downloads the engine and installs client/server dependencies; don’t skip it for local builds.
