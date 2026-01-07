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
import * as stateConstants from '../../../core/common/constants/workspace-state';
import * as stringUtils from '../../../core/common/utils/string-utils';
import { globals } from '../../../core/globals';
import localize from '../../../i18n/localize';

export function setStatusBar() {
	// Get the active files
	const activeDataPath = globals.settingManager.getWorkspaceState(stateConstants.DataKey);
	const activeTemplatePath = globals.settingManager.getWorkspaceState(stateConstants.TemplateKey);
	
	// Set the status bar according to the active files
	return vscode.window.setStatusBarMessage(stringUtils.getStatusBarString(activeDataPath, activeTemplatePath,
		localize('vscode-fhir-liquid-converter.configuration.title'), localize('common.data'), localize('common.template')));
}
