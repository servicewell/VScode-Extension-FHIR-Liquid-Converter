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
import * as glob from 'glob';
import * as path from 'path';
		
export function writeJsonToFile(filePath: string, msg: object) {
	const flag = checkCreateFolders(path.dirname(filePath));
	fs.writeFileSync(filePath, JSON.stringify(msg, null, 4));
	return flag;
}

export function writeInvalidJsonToFile(filePath: string, msg: string) {
	const flag = checkCreateFolders(path.dirname(filePath));
	fs.writeFileSync(filePath, msg);
	return flag;
}

export function checkCreateFolders(resultFolder: string) {
	if (!fs.existsSync(resultFolder)) {
		fs.mkdirSync(resultFolder, { recursive: true });
		return false;
	}
	return true;
}

export function getAllPaths(directory: string, pattern: string): string[] {
	const searchPattern = directory + pattern;
	const files: string[] = glob.sync(searchPattern, {}).map(uri => uri.replace(/\\/g, '/'));
	return files;
}

export async function isEmptyDir(dirname) {
	const dirIter = await fs.promises.opendir(dirname);
	const result = await dirIter[Symbol.asyncIterator]().next();
	if (!result.done) {
		await dirIter.close();
	}
	return result.done;
}
