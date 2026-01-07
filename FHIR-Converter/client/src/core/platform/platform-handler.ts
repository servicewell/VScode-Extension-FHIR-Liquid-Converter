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
import * as os from 'os';
import * as path from 'path';
import * as engineConstants from '../common/constants/engine';
import { TemplateManagementError } from '../common/errors/template-management-error';
import * as osUtils from '../common/utils/os-utils';
import { MacPlatformData } from './mac-platform-data';
import { IPlatformData } from './platform-data';
import { WindowsPlatformData } from './windows-platform-data';

export class PlatformHandler {
	private static _instance = new PlatformHandler();
	private platformData: IPlatformData;
	private supportedOS: Array<string> = ['win32', 'darwin'];
	
	private constructor() {
		if (osUtils.isWindows()) {
			this.platformData = new WindowsPlatformData();
		} else if (osUtils.isMac()) {
			this.platformData = new MacPlatformData();
		}
	}

	static getInstance(): PlatformHandler {
		return PlatformHandler._instance;
	}

	getPlatformData(): IPlatformData {
		return this.platformData;
	}

	isSupportedOS(): Boolean {
		if (this.supportedOS.includes(os.platform())) {
			return true;
		}
		return false;
	}

	extractOras() {
		try {
			if (osUtils.isMac()) {
				const renameCmd = `mv ${engineConstants.DefaultEngineOrasName} ${this.platformData.orasExecCmd}`;
				const tarCmd =  `tar -zxvf ${engineConstants.DefaultEngineOrasPackageName}`;
				const cmd = `${tarCmd}; ${renameCmd}`;
				cp.execSync(cmd, {
					cwd: engineConstants.DefaultEngineFolder
				});
			}
		} catch (err) {
			throw new TemplateManagementError(err.stderr.toString());
		}
	}

	getDefaultWorkspaceUri(folder: string) {
		if (this.platformData.defaultWorkspaceFile) {
			return path.join(folder, this.platformData.defaultWorkspaceFile);
		}
		return folder;
	}
}
