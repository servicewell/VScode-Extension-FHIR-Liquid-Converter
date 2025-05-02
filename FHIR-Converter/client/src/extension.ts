/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import { LanguageClient } from 'vscode-languageclient';
import { createLanguageClient } from './core/language-client/language-client';
import { globals } from './core/globals';
import localize from './i18n/localize';
import * as path from 'path';
import * as fs from 'fs';
import * as stringUtils from './core/common/utils/string-utils';
import * as configurationConstants from './core/common/constants/workspace-configuration';
import * as vscode from 'vscode';
import { createConverterWorkspaceCommand } from './view/user-commands/create-converter-workspace';
import { convertCommand } from  './view/user-commands/convert';
import { updateTemplateFolderCommand } from  './view/user-commands/update-template-folder';
import { selectTemplateCommand } from  './view/user-commands/select-template';
import { selectDataCommand } from  './view/user-commands/select-data';
import { pullTemplatesCommand } from  './view/user-commands/pull-templates';
import { pullSampleDataCommand } from './view/user-commands/pull-sample-data';
import { pullOfficialTemplatesCommand } from  './view/user-commands/pull-official-templates';
import { pushTemplatesCommand } from  './view/user-commands/push-templates';
import { loginRegistryCommand } from  './view/user-commands/login-registry';
import { logoutRegistryCommand } from  './view/user-commands/logout-registry';
import { convertFhirToFshCommand } from  './view/user-commands/convert-fhirtofsh';
import { registerCommand } from './view/common/commands/register-command';
import { SettingManager } from './core/settings/settings-manager';
import { setStatusBar } from './view/common/status-bar/set-status-bar';
import { ConfigurationError } from './core/common/errors/configuration-error';
import { converterWorkspaceExists } from './view/common/workspace/converter-workspace-exists';
import { Reporter } from './telemetry/telemetry';
import { checkCreateFolders } from './core/common/utils/file-utils';
import { PlatformHandler } from './core/platform/platform-handler';

let client: LanguageClient;

export async function activate(context: vscode.ExtensionContext) {
	// Create telemetry report
	context.subscriptions.push(new Reporter(context));

	// Init setting manager
	globals.settingManager = new SettingManager(context, configurationConstants.ConfigurationSection);

	// Set status bar
	setStatusBar();

	// Init default result folder
	let resultFolder: string = globals.settingManager.getWorkspaceConfiguration(configurationConstants.ResultFolderKey);
	if (!resultFolder) {
		resultFolder = path.join(globals.settingManager.context.storagePath, configurationConstants.DefaultResultFolderName);
		checkCreateFolders(resultFolder);
		await globals.settingManager.updateWorkspaceConfiguration(configurationConstants.ResultFolderKey, resultFolder);
	}

	// update template folder to workspace folder for showing the template folder in the explorer
	updateTemplateFolderToWorkspaceFolder();
	vscode.workspace.onDidChangeConfiguration(async () => {
		updateTemplateFolderToWorkspaceFolder();
	});

	// Start the client. This will also launch the server
	client = createLanguageClient(context);
	client.start();

	// Register commands
	registerCommand(context, 'vscode-fhir-liquid-converter.createConverterWorkspace', () => { throw new Error("Not implemented"); createConverterWorkspaceCommand(); } );

	registerCommand(context, 'vscode-fhir-liquid-converter.convert', () => convertCommand(false)); // Normal conversion
	
	registerCommand(context, 'vscode-fhir-liquid-converter.convertWithoutValidation', () => convertCommand(true)); // Without validation

	registerCommand(context, 'vscode-fhir-liquid-converter.selectData', selectDataCommand);

	registerCommand(context, 'vscode-fhir-liquid-converter.selectTemplate', selectTemplateCommand);

	registerCommand(context, 'vscode-fhir-liquid-converter.updateTemplateFolder', updateTemplateFolderCommand);

	registerCommand(context, 'vscode-fhir-liquid-converter.convertFhirToFsh', convertFhirToFshCommand);
	// Extract Oras
	PlatformHandler.getInstance().extractOras();
}

export function deactivate(context: vscode.ExtensionContext): Thenable<void> | undefined {
	// Stops the language client if it was created
	if (!client) {
		return undefined;
	}
	return client.stop();
}

function updateTemplateFolderToWorkspaceFolder() {
	const workspacePath: string | undefined = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
	const templateFolder: string | undefined = workspacePath ? path.join(workspacePath, 'input/flc/templates') : undefined;
	if (templateFolder && fs.existsSync(templateFolder)) {
		globals.settingManager.updateWorkspaceState(configurationConstants.TemplateFolderKey, templateFolder);
	} else {
		throw new ConfigurationError(localize('message.noTemplateFolderProvided'));
	}
}
