/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class SettingManager {
	private _context: vscode.ExtensionContext;
	private _workspaceSection: string;

	constructor(context: vscode.ExtensionContext, workspaceSection: string) {
		this._context = context
		this._workspaceSection = workspaceSection;
	}

	public get context() {
		return this._context;
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
