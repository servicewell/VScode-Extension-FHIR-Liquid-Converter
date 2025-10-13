/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 * 
 * ----------------------------------------------------
 * Copyright 2025 ServiceWell AB
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
import * as gofsh from 'gofsh';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as vscode from 'vscode';
import * as engineConstants from '../../core/common/constants/engine';
import { globals } from '../../core/globals';
import { logChannel } from '../../extension';
import localize from '../../i18n/localize';
import * as interaction from '../common/file-dialog/file-dialog-interaction';

export async function convertFhirToFshCommand(uri?: vscode.Uri) {

	logChannel.show(true);

	// Add conversion bar
	const conversionBar: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	conversionBar.text = '$(sync~spin) Converting...';
	conversionBar.show();

	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: 'Converting FHIR to FSH...',
			cancellable: false
		},
		async (progress) => {
			try {
				const unsavedTemplates = interaction.getUnsavedFiles(engineConstants.TemplateFileExt);
				if (unsavedTemplates.length > 0) {
					await interaction.askSaveFiles(
						unsavedTemplates,
						localize('message.saveTemplatesBeforeRefresh'),
						localize('message.save'),
						localize('message.ignore')
					);
				}

				let fhirDoc: vscode.TextDocument | undefined;
	
				if (vscode.window.activeTextEditor) {
					fhirDoc = vscode.window.activeTextEditor.document;
				} else if (uri) {
					fhirDoc = await vscode.workspace.openTextDocument(uri);
				}

				if (!fhirDoc) {
					vscode.window.showErrorMessage('No active or selected FHIR file found for conversion.');
					return;
				}
	
				const fhirJson = fhirDoc.getText();
				logChannel.appendLine(`Using file: ${fhirDoc.uri.fsPath}`);
				logChannel.appendLine(`FHIR JSON length: ${fhirJson.length}`);

				const results = await gofsh.gofshClient.fhirToFsh([fhirJson]);

				// Handle goFSH errors
				if (results.errors && results.errors.length > 0) {
					logChannel.appendLine(`Errors (${results.errors.length}):`);
					results.errors.forEach((e) => logChannel.appendLine(`❌ ${JSON.stringify(e, null, 2)}`));
					vscode.window.showErrorMessage(`FHIR to FSH conversion encountered ${results.errors.length} error(s). See output for details.`);
					return;
				}
				
				// Handle goFSH warnings
				if (results.warnings && results.warnings.length > 0) {
					logChannel.appendLine(`Warnings (${results.warnings.length}):`);
					results.warnings.forEach((w) => logChannel.appendLine(`⚠️ ${JSON.stringify(w, null, 2)}`));
					vscode.window.showWarningMessage(`FHIR to FSH conversion completed with ${results.warnings.length} warning(s).`);
				}

				if (!results || !results.fsh || results.fsh.toString().length === 0) {
					vscode.window.showWarningMessage('Conversion completed, but no FSH output was generated.');
					logChannel.appendLine('Conversion returned empty FSH result.');
					return;
				}
				
				// Conversion OK - get Fsh result
				const fshResult = results.fsh.toString();
				logChannel.appendLine(`FSH result received (${fshResult.length} chars)`);
				
				progress.report({ message: 'Opening FSH result...' });

				let fshDoc = await applySettingsConfiguraitions(fshResult);
	
				await vscode.window.showTextDocument(fshDoc, {
					viewColumn: vscode.ViewColumn.Four
				});
			} catch (err: any) {
				const msg = `Error during conversion: ${err.message}`;
				logChannel.appendLine(msg);
				vscode.window.showErrorMessage(msg);
			} finally {
				conversionBar.hide();
			}
		}
	);
}

async function applySettingsConfiguraitions(fshResult: string): Promise<vscode.TextDocument> {
		const examples = globals.settingManager.configSettings?.includeInIG?.examples;
		//Check if we have examples configurated
		if (examples && examples.enabled){
			logChannel.appendLine(`Examples are enabled in config...`)
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders || workspaceFolders.length === 0)
				throw new Error("No folder is oppened");
	
			const rootPath = workspaceFolders[0].uri.fsPath
			let sourceDataUri = fileURLToPath(vscode.window.visibleTextEditors.find(x => x.viewColumn === vscode.ViewColumn.One).document.uri.toString());
			logChannel.appendLine(`Source path: ${sourceDataUri}`);					
			let exampleLink = examples?.generateExampleFrom?.find(x => path.join(rootPath, x.input) === sourceDataUri);
			if (exampleLink && exampleLink.output) {
				logChannel.appendLine(`We have examples configurated to work with...`);
				let filePath: string;
				if (path.isAbsolute(exampleLink.output)){
					filePath = exampleLink.output;
				}
				else {
					filePath = path.join(rootPath, examples.outputExamplesFolder ?? "", exampleLink.output);
				}
				
				let result = fshResult;
				let index = result.indexOf("Usage: #example");
				if (index !== -1) {
					if (exampleLink.description)
						result = `${result.slice(0, index)}Description: "${exampleLink.description}"\n${result.slice(index)}`;
					if (exampleLink.title)
						result = `${result.slice(0, index)}Title: "${exampleLink.title}"\n${result.slice(index)}`;
				}
				else if (exampleLink.title || exampleLink.description && index === -1)
					throw new Error("The fsh isn't an \"#example\" so the title or description won't be applied")
				fs.writeFileSync(filePath, result, "utf8")
				return await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
			}
			else {
				logChannel.appendLine(`No match with source: ${sourceDataUri} in ${rootPath}`);	
			}
		}
		else{
			return await vscode.workspace.openTextDocument({
					content: fshResult,
					language: 'plaintext'
				});
		}
	}
