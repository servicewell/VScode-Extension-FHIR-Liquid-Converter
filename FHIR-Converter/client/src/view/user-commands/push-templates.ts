/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 * 
 * Copyright 2025 Service Well AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode';
import * as workspaceConfigurationConstants from '../../core/common/constants/workspace-configuration';
import * as workspaceStateConstants from '../../core/common/constants/workspace-state';
import * as strUtils from '../../core/common/utils/string-utils';
import { globals } from '../../core/globals';
import { TemplateManagerFactory } from '../../core/template-manager/template-manager-factory';
import localize from '../../i18n/localize';
import * as interaction from '../common/file-dialog/file-dialog-interaction';
import { showInputBox } from '../common/input/input-box';

export async function pushTemplatesCommand() {
	// Add push bar
	const pushBar: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	pushBar.text = '$(sync~spin) Pushing templates...';
	pushBar.show();

	try {
		// Get the image reference
		const imageReference = await showInputBox(localize('message.inputPushImageReference'), workspaceStateConstants.ImageReferenceKey);
		if (!imageReference) {
			return undefined;
		}

		// Get the template folder
		const templateFolder = globals.settingManager.getWorkspaceState(workspaceConfigurationConstants.TemplateFolderKey);

		// Confirm the template folder
		const selectedTemplateFolder = await interaction.openDialogSelectFolder(localize('message.selectRootTemplateFolder'), templateFolder);
		if (!selectedTemplateFolder) {
			return undefined;
		}

		// Create the template manager
		const templateManager = TemplateManagerFactory.getInstance().createTemplateManager();

		// Execute the push process
		const output = templateManager.pushTemplates(imageReference, selectedTemplateFolder.fsPath);
		
		// Show ouput message
		const refinedOutput = output.replace(/\n/g, '; ').replace(/Uploading/g, 'Uploaded');
		const buttonLabel = localize('message.copyDigestToClipboard');
		vscode.window.showInformationMessage(refinedOutput, buttonLabel)
		.then( (selected) => {
			if (selected === buttonLabel) {
				const digest = strUtils.getDigest(output);
				if (!digest) {
					vscode.window.showWarningMessage(localize('message.digestNotFound'));
					vscode.env.clipboard.writeText(refinedOutput);
				} else {
					vscode.env.clipboard.writeText(digest);
				}
			}
		});
	} finally {
		// Hide the push bar
		pushBar.hide();
	}
}
