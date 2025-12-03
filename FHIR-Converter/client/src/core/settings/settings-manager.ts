/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 *
 * -------------------------------------------------------
 * Copyright 2025 Service Well AB
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
import { load } from 'js-yaml';
import * as path from 'path';
import * as vscode from 'vscode';

export class SettingManager {
	private _context: vscode.ExtensionContext;
	private _workspaceSection: string;
	private _configSettings?: ConfigSettings;

	constructor(context: vscode.ExtensionContext, workspaceSection: string) {
		this._context = context
		this._workspaceSection = workspaceSection;
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0)
			return;

		const rootPath = workspaceFolders[0].uri.fsPath;
		const configFilePath = path.join(rootPath, "flc-config.yaml");
		if (!fs.existsSync(configFilePath)) {
			return;
		}

		try {
			const raw = fs.readFileSync(configFilePath, "utf-8");
			const obj = load(raw);
			if (obj === null || typeof obj !== "object") {
				vscode.window.showWarningMessage("FHIR Liquid Converter: flc-config.yaml could not be parsed; using defaults.");
				return;
			}
			this._configSettings = obj as ConfigSettings;
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			vscode.window.showWarningMessage(`FHIR Liquid Converter: failed to read flc-config.yaml (${message}); using defaults.`);
		}
	}

	public get context() {
		return this._context;
	}

	public get configSettings(): ConfigSettings | undefined {
		return this._configSettings;
	}

	public getWorkspaceState(key: string): any {
		return this._context.workspaceState.get(key);
	}

	public updateWorkspaceState(key: string, value: any): Thenable<void> {
		return this._context.workspaceState.update(key, value);
	}

	public getWorkspaceConfiguration(key: string): any {
		return vscode.workspace.getConfiguration(this._workspaceSection).get(key);
	}

	public updateWorkspaceConfiguration(key: string, value: any): Thenable<void> {
		return vscode.workspace.getConfiguration(this._workspaceSection).update(key, value, false);
	}
}

export interface ConfigSettings{
	flc?: {
		enabled?: boolean;
		defaultMapProfile?: string;
		engine?: string;
		inputFolder?: string;
		templateFolder?: string;
		validateTerminology?: boolean;
	}
	runtime?:{
		outputFolder: string;
	}
	terminology?:{
		requires: TerminolgyPackage[];
	}
	//dependencies?: { }
	includeInIG?:{
		examples?:{
			enabled?: boolean;
			autoGenerateOnTransform?: boolean;
			outputExamplesFolder?: string;
			removeDuplicates?: boolean;
			generateExampleFrom?: DataFshLink[];
		}
	}
}

export interface TerminolgyPackage{
	package?: string;
	version?: string;
	resources?: string[];
}

export interface DataFshLink {
	input: string;
	output: string;
	title?: string;
	description?: string;
}
