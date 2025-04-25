/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import localize from '../../i18n/localize';
import * as vscode from 'vscode';
import * as interaction from '../common/file-dialog/file-dialog-interaction';
import * as engineConstants from '../../core/common/constants/engine';
import { gofshClient } from 'gofsh';

export async function convertFhirToFshCommand(uri?: vscode.Uri) {

	const output = vscode.window.createOutputChannel("FHIR-to-FSH");
	output.show(true);

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
				output.appendLine(`Using file: ${fhirDoc.uri.fsPath}`);
				output.appendLine(`FHIR JSON length: ${fhirJson.length}`);

				const results = await gofshClient.fhirToFsh([fhirJson]);

				// Handle goFSH errors
				if (results.errors && results.errors.length > 0) {
					output.appendLine(`Errors (${results.errors.length}):`);
					results.errors.forEach((e) => output.appendLine(`❌ ${JSON.stringify(e, null, 2)}`));
					vscode.window.showErrorMessage(`FHIR to FSH conversion encountered ${results.errors.length} error(s). See output for details.`);
					return;
				}
				
				// Handle goFSH warnings
				if (results.warnings && results.warnings.length > 0) {
					output.appendLine(`Warnings (${results.warnings.length}):`);
					results.warnings.forEach((w) => output.appendLine(`⚠️ ${JSON.stringify(w, null, 2)}`));
					vscode.window.showWarningMessage(`FHIR to FSH conversion completed with ${results.warnings.length} warning(s).`);
				}

				if (!results || !results.fsh || results.fsh.toString().length === 0) {
					vscode.window.showWarningMessage('Conversion completed, but no FSH output was generated.');
					output.appendLine('Conversion returned empty FSH result.');
					return;
				}
	
				// Conversion OK - get Fsh result
				const fshResult = results.fsh.toString();
				output.appendLine(`FSH result received (${fshResult.length} chars)`);
	
				progress.report({ message: 'Opening FSH result...' });
				const fshDoc = await vscode.workspace.openTextDocument({
					content: fshResult,
					language: 'plaintext'
				});
	
				await vscode.window.showTextDocument(fshDoc, {
					viewColumn: vscode.ViewColumn.Four
				});
			} catch (err: any) {
				const msg = `Error during conversion: ${err.message}`;
				output.appendLine(msg);
				vscode.window.showErrorMessage(msg);
			} finally {
				conversionBar.hide();
			}
		}
	);
}
