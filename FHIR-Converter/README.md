> **Notice**  
> Service Well AB maintained fork. Modifications are under Apache 2.0. Upstream Microsoft code remains under MIT (see LICENSE-MICROSOFT).

# FHIR Liquid Converter (FORK from FHIR CONVERTER)

Work with FHIR Liquid templates directly inside an IG. Templates are shipped as a FHIR package (no ACR/ORAS), plus FHIR → FSH via GoFSH.

## Requirements
- VS Code 1.81+
- Node 20+ for building
- Git Bash on Windows (`C:\Program Files\Git\bin\bash.exe`) for postinstall

## Install the extension
- Use the published VSIX, or build your own (`npm run package`), then in VS Code: “Extensions: Install from VSIX…”.

## Quick start (IG workspace)
1. Ensure structure in your IG:
   - `input/flc/templates` (Liquid templates)
   - `input/flc/sampledata` (sample data)
   - `flc-config.yaml` (see `flc-config.example.yaml`)
   - `flc-generated/` (results)
2. Select a template (`.liquid`) and data file (`.json/.xml/.hl7/.ccda`) from the explorer context menu.
3. Run “FHIR Liquid Converter: Convert data” (Ctrl+R). You get data/template/result panes.
4. For batch convert: right-click an input folder → “FHIR Liquid Converter: Batch convert folder”, pick output folder when prompted. The engine processes all files in the input folder.

## Settings (workspace)
- `vscode-fhir-liquid-converter.engineFolderPath`: override engine path (default: bundled `engine/`).
- `vscode-fhir-liquid-converter.templateFolder`: override template root (default: `input/flc/templates`).
- `vscode-fhir-liquid-converter.resultFolder`: override output (default: `flc-generated`).

## What’s different in this fork
- IG-first: templates live with the IG and version as a FHIR package.
- No ACR/ORAS dependency for templates.

## Telemetry
No telemetry is sent (aiKey removed). Nothing leaves your machine.

## Build a VSIX (dev)
```
npm install --ignore-scripts
npm run postinstall_with_git_bash
npm run compile
npm run bundle
npm run package
```
See `BUILDING.md` for details.

## License
Service Well AB modifications: Apache 2.0 (`LICENSE`). Upstream Microsoft code: MIT (`LICENSE-MICROSOFT`).
