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
import * as engineConstants from '../common/constants/engine';
import * as fileUtils from '../common/utils/file-utils';
import * as stringUtils from '../common/utils/string-utils';
import { IConverterEngine } from './engine/converter-engine';

export class Converter {
	private _engine: IConverterEngine;
	private _resultFolder: string;
	
	constructor (engine: IConverterEngine, resultFolder: string) {
		this._engine = engine;
		this._resultFolder = resultFolder;
	}

	async convert(dataFile: string, skipValidation: boolean = false) {
		const result = this._engine.process(dataFile, skipValidation);
		await this.clearHistory(result.resultFile);		
		return result;
	}

	getHistory(filePath: string) {
		const resultName = stringUtils.getFileNameWithoutTwoExt(filePath);
		const files: string[] = fileUtils.getAllPaths(this._resultFolder, `/**/${resultName}.*.json`);
		const sortedFiles = stringUtils.getDescendingSortString(files);
		return sortedFiles;
	}

	async clearHistory(filePath: string, maxNum = engineConstants.MaxHistoryFilesNum, remainNum = engineConstants.RemainHistoryFilesNum) {
		const files = this.getHistory(filePath);
		if (files.length > maxNum) {
			const deleteFiles = files.slice(remainNum, files.length);
			const promiseAll = [];
			for (const file of deleteFiles) {
				promiseAll.push(new Promise<void>((resolve, reject) => {
					fs.unlink(file, (err) => {
						if (err) { 
							reject(err); 
						} else {
							resolve();
						}
					});
				}));
			}
			await Promise.all(promiseAll);
		}
	}
}
