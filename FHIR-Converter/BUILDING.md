# Build and Package (VSIX)

Step-by-step to create a bundled VSIX from this repo.

## Prerequisites
- Node.js 20+ (22 works too)
- npm 10+
- Git for Windows (Git Bash available at `C:\Program Files\Git\bin\bash.exe`)

## Build steps (Windows, PowerShell)
```pwsh
cd FHIR-Converter
# Install deps without triggering the bash-based postinstall
npm install --ignore-scripts
# Run postinstall using Git Bash (downloads engine + installs client/server deps)
npm run postinstall_with_git_bash
# Compile TypeScript
npm run compile
# Bundle client + server with esbuild (outputs to dist/)
npm run bundle
# Create the VSIX (outputs vscode-fhir-liquid-converter-<version>.vsix in this folder)
npm run package
```

## Install the VSIX in VS Code
- Command Palette → “Extensions: Install from VSIX…” → pick the generated `.vsix`
- Or: `code --install-extension .\vscode-fhir-liquid-converter-<version>.vsix --force`

## Notes
- If you lack Git Bash, install Git for Windows or adjust `postinstall_with_git_bash` to point at your Bash path.
- The package script bundles everything into `dist/` to keep the VSIX small; `main` and the language server both load from `dist`.
