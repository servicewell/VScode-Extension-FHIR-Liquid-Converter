> ### ⚠️ **General Notice**  
> This is a **Service Well AB maintained fork** of the [original Microsoft FHIR Converter VS Code Extension](https://github.com/microsoft/vscode-azurehealthcareapis-tools).  
> All modifications in this repository are made by **Service Well AB** and are licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).  
> This fork includes additional functionality and tools that may not be compatible with the upstream version.  
> For questions, contributions, or support, please contact us via GitHub or reach out directly to Service Well AB.

<br/>

> ### 📄 **Licensing Notice**  
> This repository contains:
> - Original Microsoft code under the MIT License ([LICENSE-MICROSOFT](./LICENSE-MICROSOFT))  
> - Service Well AB modifications licensed under Apache 2.0 ([LICENSE](./LICENSE)) 

<br/>

# Getting Started

## Start Converting

**Folder structure in FHIR IG:**

```
project-ig-root/
├── flc-generated/
├── input/
│   ├── fsh/
│   └── flc/
│       ├── Templates/
│       │   └── metadata.json
│       └── SampleData/
└── flc-config.yaml
```

To run the converter, first make sure the folder structure is as above.


### 1. Select ExamplePatient.json as Data
- Right click on **ExamplePatient.json** and select as the data file.

---

### 2. Select ExamplePatient.liquid as Template
- Right click on **ExamplePatient.liquid** and select as the template.

---

### 3. Run the Converter
- Execute the conversion process.
- Right click on **ExamplePatient.liquid** again and click Convert Data

---

### 4. View the Result
- You should now have three windows open:
  - **Source data**
  - **Liquid template**
  - **Converted result**

# Debugging
Read [Developer Guide - Getting Started for Extension Developers](DEVELOPER_GUIDE_DEBUGGING.md) to setup a developer debugging environment


# FHIR Converter VS Code extension

[![Build Status](https://microsofthealth.visualstudio.com/Health/_apis/build/status/Resolute/Converter/Dev-CI-SecurityAssessment-VSCode-Tools?branchName=main)](https://microsofthealth.visualstudio.com/Health/_build/latest?definitionId=531&branchName=main)

FHIR Converter VS Code Extension accompanies the following Microsoft FHIR managed services:
1. [FHIR Service in Azure Health Data Services](https://docs.microsoft.com/en-us/azure/healthcare-apis/fhir/): A new managed FHIR offering in Azure that lets you put other healthcare data (like DICOM® images) in the same workspace.
2. [Azure API for FHIR](https://azure.microsoft.com/services/azure-api-for-fhir/): A managed PaaS offering in Azure that enables rapid exchange of data through Fast Healthcare Interoperability Resources (FHIR®) APIs.

FHIR Converted VS Code Extension also accompanies the following Microsoft open-source projects:
1. [FHIR Server for Azure](https://github.com/microsoft/fhir-server): An open-source implementation of the [HL7 FHIR](https://www.hl7.org/fhir/) specification designed for the Microsoft cloud.
2. [FHIR Converter OSS](https://github.com/microsoft/FHIR-Converter): An open-source project that enables conversion of health data from legacy format to FHIR.

These products have the capability to convert HL7v2, C-CDA, XML and JSON data to FHIR bundles using [Liquid](https://shopify.github.io/liquid/) templates. Microsoft publishes ready-to-use Liquid templates for HL7v2 and C-CDA to FHIR conversion, as well as sample templates for JSON to FHIR conversion. JSON messages do not have a standardized message type structure like HL7v2 or C-CDA do, so we provide you with sample JSON messages and the corresponding liquid templates for you to easily modify per your own JSON.

This extension provides an interactive editing and verification experience to create new templates and customize the default templates to meet specific needs. Currently, this extension is available on Windows and macOS system.

## Getting started

Before using the extension, you need to confirm whether the [.Net Core 3.1](https://dotnet.microsoft.com/download/dotnet/3.1) is installed in your machine. If not, you should download it first.

After you have installed the extension, follow these steps to edit the templates:
1. Login to your ACR if needed.
2. Get starting templates and put those in a folder. You can also use the sample templates published by Microsoft by following the instructions below.
3. Get sample data for testing. You can use the sample data provided by Microsoft by following the instructions.
4. Create a new converter workspace by pressing CTRL+W. You will select the root template folder and the data folder during the process.
5. Select template file and test data file using the context menu.
6. Convert data by pressing CTRL+R or by the command in the context menu. After converting, the extension should open a 3-pane view including data, template and converted FHIR bundle in the panes.
7. Edit template and/or data files and save them. Press CTRL+R to refresh the output. The output pane should get refreshed and highlight the changes in the output.
8. Save and push the changed templates to your Azure Container Registry in order to use it in $convert-data API in the FHIR Server.

See relevant service documentation for using the templates in data conversion process:

1. [$convert-data](https://docs.microsoft.com/en-us/azure/healthcare-apis/convert-data) operation in Azure API for FHIR.
1. [$convert-data](https://github.com/microsoft/fhir-server/blob/master/docs/ConvertDataOperation.md) operation in FHIR Server for Azure.
1. [FHIR Converter command line tool](https://github.com/microsoft/FHIR-Converter#command-line-tool) in FHIR Converter OSS project.

## How to guide

### 1. Convert messages into FHIR bundles

In a converter workspace, template files and data files are shown in the explorer view. To start template editing, select a template file and a data file.

To select a file as the root template file, right click on the file having extension `.liquid` in the explorer view and select the menu item `FHIR Converter: Select as template (*.liquid)`. Similarly, to select a data file, right click on the data file having extension `.hl7`, `.ccda`, `.json` or `.xml` and select the menu item `FHIR Converter: Select as data file (*.[hl7|ccda|json|xml])`.

Both template file and data file are necessary, and you can view the selected files in the status bar before converting Data. If one of them is missing, you will be prompted to select the missing one. If both template file and data file are selected, you can convert data by selecting the context menu item `FHIR Converter: Convert data` or using the keyboard shortcut (`Ctrl + R`), and the result will be shown in results pane.

After converting data, the data segments not used in the FHIR results will be underlined in the data pane. If you don't need this feature, you can deselect the option called `Enable Unused Segments Diagnostic` in `Preferences > Settings > Workspace > Extensions > FHIR Converter` or add a setting `"vscode-fhir-liquid-converter.enableUnusedSegmentsDiagnostic": false` in the workspace setting file.

![conversion](assets/conversion.gif)

### 7. Modify the selected data and templates

After modifying the template files or the data files, you can convert data by selecting the context menu item `FHIR Converter: Convert data` or pressing the keyboard shortcut (`Ctrl + R`). A differential view for the conversion result will be shown in the result tab highlighting the differences from the last run. You can jump to the previous or the next changes using the icons in the upper right corner. Differential view is turned on by default, and if you don't need this feature, you can deselect the option called `Enable Diff View` in `Preferences > Settings > Workspace > Extensions > FHIR Converter` or add a setting `"vscode-fhir-liquid-converter.enableDiffView": false` in the workspace setting file.

After modifying the templates or data, remember to save the template files or data because the templates and data on the file system are used during the conversion process. If there are some unsaved templates or data, the user will be prompted to save these unsaved templates or data.

![editing](assets/editing.gif)

If you want to jump into the snippet templates to make some modification, you can select the context menu item `Go to Definition (F12)`  or press the keyboard shortcut `Ctrl + Click (Windows) / ⌘ + Click (macOS)` when hovering over the snippet templates. If you just hover over the snippet templates and press `Ctrl / ⌘`, a quick content preview of snippet templates will be shown for you.

Currently, the following features for snippet templates editing are supported:

- Jumping into the snippet templates
- Quick content preview of snippet templates
- Checking if snippet templates exist
- Auto completion of snippet templates

![snippet-templates-editing](assets/snippet-templates-editing.gif) 

## Contributing


## License

[MIT](LICENSE-MICROSOFT)  
[APACHE 2.0](LICENSE)
