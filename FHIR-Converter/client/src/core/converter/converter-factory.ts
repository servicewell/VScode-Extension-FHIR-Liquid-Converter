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

import * as fs from 'fs';
import localize from '../../i18n/localize';
import { DefaultEngineFolder } from '../common/constants/engine';
import * as configurationConstants from '../common/constants/workspace-configuration';
import * as stateConstants from '../common/constants/workspace-state';
import { ConfigurationError } from '../common/errors/configuration-error';
import { ConversionError } from '../common/errors/conversion-error';
import { globals } from '../globals';
import { Converter } from './converter';
import { FhirConverterEngine } from './engine/fhir-converter-engine';

export class ConverterEngineFactory {
	private static _instance = new ConverterEngineFactory();
	private constructor() {}

	static getInstance(): ConverterEngineFactory {
		return ConverterEngineFactory._instance;
	}

	createConverter() {
		// Check that the result folder is available
		const resultFolder = globals.settingManager.getWorkspaceConfiguration(configurationConstants.ResultFolderKey);
		if (!resultFolder) {
			throw new ConfigurationError(localize('message.noResultFolderProvided'));
		}

		// Check if result folder exists
		if (!fs.existsSync(resultFolder)) {
			throw new ConversionError(localize('message.resultFolderNotExists', resultFolder));
		}

		// Check that the template folder is available
		const templateFolder: string = globals.settingManager.getWorkspaceState(configurationConstants.TemplateFolderKey);
		if (!templateFolder) {
			throw new ConfigurationError(localize('message.noTemplateFolderProvided'));
		}

		// Check if template folder exists
		if (!fs.existsSync(templateFolder)) {
			throw new ConversionError(localize('message.templateFolderNotExists', templateFolder));
		}

		// Check that the root template is available
		const rootTemplate = globals.settingManager.getWorkspaceState(stateConstants.TemplateKey);
		if (!rootTemplate) {
			throw new ConversionError(localize('message.needSelectTemplate'));
		}

		let engineFolder: string = globals.settingManager.getWorkspaceConfiguration(configurationConstants.EngineFolderPathKey);
		if (!engineFolder || !fs.existsSync(engineFolder))
			engineFolder = DefaultEngineFolder;

		// Check if engine folder exists
		if (!fs.existsSync(engineFolder)){
			throw new ConversionError(localize('message.invalidBackendPath', engineFolder))
		}

		// create the engine
		let engine = new FhirConverterEngine(templateFolder, rootTemplate, resultFolder, engineFolder);

		// create the converter
		return new Converter(engine, resultFolder);
	}
}
