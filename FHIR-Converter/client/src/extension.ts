/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 * 
 * -------------------------------------------------------
 * Copyright 2025 Service Well AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import * as configurationConstants from './core/common/constants/workspace-configuration';
import { checkCreateFolders } from './core/common/utils/file-utils';
import { globals } from './core/globals';
import { createLanguageClient } from './core/language-client/language-client';
import { PlatformHandler } from './core/platform/platform-handler';
import { SettingManager } from './core/settings/settings-manager';
import { Reporter } from './telemetry/telemetry';
import { registerCommand } from './view/common/commands/register-command';
import { setStatusBar } from './view/common/status-bar/set-status-bar';
import { convertCommand } from './view/user-commands/convert';
import { convertFhirToFshCommand } from './view/user-commands/convert-fhirtofsh';
import { selectDataCommand } from './view/user-commands/select-data';
import { selectTemplateCommand } from './view/user-commands/select-template';

export const logChannel = vscode.window.createOutputChannel('FHIR Liquid Converter');
let client: LanguageClient;

export async function activate(context: vscode.ExtensionContext) {

	console.log('activate() reached in FHIR Liquid Converter');
	context.subscriptions.push(logChannel);
	logChannel.appendLine('FHIR Liquid Converter starting up...');
	// Create telemetry report
	context.subscriptions.push(new Reporter(context));

	// Init setting manager
	globals.settingManager = new SettingManager(context, configurationConstants.ConfigurationSection);

	// Set status bar
	setStatusBar();

	// Resolve base path for result folder: prefer workspace, fallback to storage or temp
	const workspacePath =
		vscode.workspace.workspaceFolders?.[0].uri.fsPath ??
		context.storageUri?.fsPath ??
		context.globalStorageUri.fsPath ??
		require('os').tmpdir();

	// Get result folder from config, or use default 'flc-generated' if none is set
	let resultFolder: string | undefined = globals.settingManager.getWorkspaceConfiguration(configurationConstants.ResultFolderKey);

	if (!resultFolder) {
		resultFolder = 'flc-generated'; // default, also matches package.json configuration default
	}

	// Ensure it's absolute path relative to workspace root
	const resultFolderPath = path.resolve(workspacePath, resultFolder);
	checkCreateFolders(resultFolderPath);

	// Save resolved folder to workspace state (used by the rest of the extension)
	await globals.settingManager.updateWorkspaceConfiguration(configurationConstants.ResultFolderKey, resultFolderPath);

	// Update template folder visibility
	updateTemplateFolderToWorkspaceFolder();
	vscode.workspace.onDidChangeConfiguration(async () => {
		updateTemplateFolderToWorkspaceFolder();
	});

	// Start the client. This will also launch the server
	client = createLanguageClient(context);
	client.start();

	// Register commands
	registerCommand(context, 'vscode-fhir-liquid-converter.convert', () => convertCommand(false));
	registerCommand(context, 'vscode-fhir-liquid-converter.convertWithoutValidation', () => convertCommand(true));
	registerCommand(context, 'vscode-fhir-liquid-converter.selectData', selectDataCommand);
	registerCommand(context, 'vscode-fhir-liquid-converter.selectTemplate', selectTemplateCommand);
	registerCommand(context, 'vscode-fhir-liquid-converter.convertFhirToFsh', convertFhirToFshCommand);

	// Extract ORAS binary
	PlatformHandler.getInstance().extractOras();

	setTimeout(() => {
		logChannel.appendLine('✅ FHIR Liquid Converter is ready.');
	}, 100);
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
		logChannel.appendLine('No valid template folder found at input/flc/templates. Skipping template folder setup.');
		vscode.window.showWarningMessage('FHIR Liquid Converter: Could not find template folder at input/flc/templates. Some features may not work.');
	}
}
