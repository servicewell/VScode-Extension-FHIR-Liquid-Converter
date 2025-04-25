> ### ⚠️ **Notice**  
> This is a **Service Well AB maintained fork** of the [original Microsoft FHIR Converter VS Code Extension](https://github.com/microsoft/vscode-azurehealthcareapis-tools).  
> All modifications in this repository are made by **Service Well AB** and are licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).  
> This fork includes additional functionality and tools that may not be compatible with the upstream version.  
> For questions, contributions, or support, please contact us via GitHub or reach out directly to Service Well AB.

<br/>

# Developer Guide - Getting Started for Extension Developers

## Prerequisites
Before setting up the project, ensure you have the following installed:
- [Git for Windows](https://gitforwindows.org/)
- [Node.js and npm](https://nodejs.org/) (Latest LTS recommended)
- ~~A Linux distribution connected to the **WSL** extension~~
- ~~The latest version of **TypeScript** (`npm install -g typescript`)~~

## First-time Setup

1. Clone the required repositories:
   ```sh
   git clone https://github.com/servicewell/FHIR-Liquid-Converter.git
   git clone https://github.com/servicewell/VScode-Extension-FHIR-Liquid-Converter.git
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

### Errors when running "npm install"
Make sure you are running a Bash-terminal (Terminal / + / Git Bash), and that node and npm is at least at the required versions by typing "node -v" and "npm -v". The required versions is >20 for node and >10 for npm. Also make sure your Visual Studio Code is updated to at least 1.81 (Help/About). 

### Issues with Git Bash vs. WSL Bash
If you encounter issues related to **Git Bash vs. WSL Bash**, in Terminal(Git Bash):
- Try running `npm run postinstall_with_git_bash` and `npm run download-templates_with_git_bash`.

## Start Converting
See the [README](./README.md) for instructions on how to start using the extension to convert data.

## Build and package VSIX
For details on how to build, package and install the extension, see the [Developer Guide - Creating and Installing a VSIX Extension](./DEVELOPER_GUIDE_VSIX_BUILD.md).