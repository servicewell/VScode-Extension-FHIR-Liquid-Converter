# Developer Guide - Getting Started for Extension Developers

## Prerequisites
Before setting up the project, ensure you have the following installed:
- [Git for Windows](https://gitforwindows.org/)
- [Node.js and npm](https://nodejs.org/) (Latest LTS recommended)
- A Linux distribution connected to the **WSL** extension
- The latest version of **TypeScript** (`npm install -g typescript`)

## First-time Setup

1. Clone the required repositories:
   ```sh
   git clone https://servicewell.visualstudio.com/swts/_git/fhir-liquid-converter
   git clone https://servicewell.visualstudio.com/swts/_git/vscode-fhir-liquid-converter
   ```
2. Use the following suggested folder structure:
   ```
   swts/
   ├── fhir-liquid-converter/
   ├── vscode-fhir-liquid-converter/
   ```

3. Open **Command Prompt (cmd)** and navigate to:
   ```sh
   cd swts\vscode-fhir-liquid-converter\FHIR-Converter
   ```
4. Install dependencies:
   ```sh
   npm install
   ```

## Troubleshooting

### Issues with Git Bash vs. WSL Bash
If you encounter issues related to **Git Bash vs. WSL Bash**, modify `package.json`:
- Change `postinstall` and `download-templates` to `postinstall_with_git_bash` and `download-templates_with_git_bash`.


## Configuration
Build the c# project:
```plaintext
swts\fhir-liquid-converter\src\Microsoft.Health.Fhir.Liquid.Converter.Tool
```
and set the correct path to **FHIR Engine output folder** in:
```plaintext
...\FHIR-Converter\client\src\core\common\constants\engine.ts
```
Update the following line to match the output folder of the **FHIR Converter Engine** you want to debug with:
```typescript
export const DefaultEngineFolder = "C:\Users\TheoKinell\source\repos\swts\fhir-liquid-converter\src\Microsoft.Health.Fhir.Liquid.Converter.Tool\bin\Debug\net8.0";
```

## Start Converting

See the [README](./README.md) for instructions on how to start using the extension to convert data.


## Build and package VSIX

For details on how to build, package and install the extension, see the [Developer Guide - Creating and Installing a VSIX Extension](./DEVELOPER_GUIDE_VSIX_BUILD.md).