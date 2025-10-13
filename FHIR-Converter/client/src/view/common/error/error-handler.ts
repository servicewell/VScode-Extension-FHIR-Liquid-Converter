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
import * as configurationConstants from '../../../core/common/constants/workspace-configuration';
import { ConfigurationError } from '../../../core/common/errors/configuration-error';
import { ConversionError } from '../../../core/common/errors/conversion-error';
import { TemplateManagementError } from '../../../core/common/errors/template-management-error';
import { globals } from '../../../core/globals';
import localize from '../../../i18n/localize';
import * as interaction from '../../common/file-dialog/file-dialog-interaction';

export async function handle(error: Error): Promise<void> {
	let errorType = 'error.unexpected';
	if (error instanceof ConfigurationError || error instanceof ConversionError || error instanceof TemplateManagementError) {
		errorType = error.name;
	}

	// Handle the error using text pattern due to the lack of error code from engine tool
	if (error.message.includes('Could not find metadata.json in template directory')) {
		const templateFolder: string = globals.settingManager.getWorkspaceState(configurationConstants.TemplateFolderKey);
		await interaction.askCreateMetadata(localize(errorType, localize('message.noMetadata', templateFolder)), localize('message.createMetadata'), templateFolder)
	} else {
		vscode.window.showErrorMessage(localize(errorType, error.message));
	}
}
