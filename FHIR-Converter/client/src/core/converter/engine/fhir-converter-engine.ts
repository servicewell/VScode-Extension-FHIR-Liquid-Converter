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

import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import localize from '../../../i18n/localize';
import * as engineConstants from '../../common/constants/engine';
import { ConversionError } from '../../common/errors/conversion-error';
import * as engineUtils from '../../common/utils/engine-utils';
import * as fileUtils from '../../common/utils/file-utils';
import * as stringUtils from '../../common/utils/string-utils';
import { IConverterEngine } from './converter-engine';

export class FhirConverterEngine implements IConverterEngine {
	private _engineExecCmd: string;
	private _templateFolder: string;
	private _rootTemplate: string;
	private _engineFolder: string;
	private _resultFolder: string;

	constructor(templateFolder: string, rootTemplate: string, resultFolder: string, engineFolder: string, engineExecCmd: string = engineConstants.DefaultEngineExecCmd) {
		this._templateFolder = templateFolder;
		this._rootTemplate = rootTemplate;
		this._resultFolder = resultFolder;
		this._engineFolder = engineFolder;
		this._engineExecCmd = engineExecCmd;
	}

	process(dataFile: string, skipValidation: boolean) {
		// Check that data file is available 
		if (!dataFile) {
			throw new ConversionError(localize('message.needSelectData'));
		}

		// Check if data file exists
		if (!fs.existsSync(dataFile)) {
			throw new ConversionError(localize('message.dataFileNotExists', dataFile));
		}
		
		// Call the engine
		const timestamp = new Date().getTime().toString();
		const resultFile = path.join(this._resultFolder, stringUtils.getResultFileName(dataFile, this._rootTemplate, timestamp));
		const defaultResultFile = path.join(this._resultFolder, engineConstants.DefaultResultFile);
		const rootTemplate = stringUtils.getRelativePathWithoutExt(this._templateFolder, this._rootTemplate);
		const paramList = [' convert', 
			'-d', stringUtils.addQuotes(this._templateFolder), 
			'-r',  stringUtils.addQuotes(rootTemplate), 
			'-n', stringUtils.addQuotes(dataFile), 
			'-f', stringUtils.addQuotes(defaultResultFile), 
			'-t'];
			
		if (skipValidation) {
			paramList.push('-a'); // Add the AllowOutputValidationErrors flag
		}
		
		const cmd =  this._engineExecCmd + paramList.join(' ');
		try {
			cp.execSync(cmd, {
				cwd: this._engineFolder
			});
		} catch (err) {
			throw new ConversionError(err.toString());
		}
		if (fs.existsSync(defaultResultFile)) {
			const resultMsg = JSON.parse(fs.readFileSync(defaultResultFile).toString());
			if (engineUtils.checkConversionHasValidationError(resultMsg)) {
				// Validation error
				const unescapedRawOutput = resultMsg.RawOutput
												.replace(/\\"/g, '"')   // Unescape quotes (\" → ")
												.replace(/\\r\\n/g, "\n") // Normalize Windows-style newlines
												.replace(/\\n/g, "\n")  // Normalize Unix-style newlines
												.replace(/\\t/g, "\t"); // Unescape tabs if needed
				fileUtils.writeInvalidJsonToFile(resultFile, unescapedRawOutput); 
				return { resultFile: resultFile, traceInfo: resultMsg.TraceInfo, validationErrorMessage: resultMsg.ErrorMessage };
			}
			
			if (!engineUtils.checkConversionSuccess(resultMsg)) {
				// Fail:
				throw new ConversionError(localize('message.noResponseFromEngine'));
			}
			
			// Success:
			fileUtils.writeJsonToFile(resultFile, resultMsg.FhirResource);
			return { resultFile: resultFile, traceInfo: resultMsg.TraceInfo };
		} else {
			throw new ConversionError(localize('message.noResponseFromEngine'));
		}
	}
}
