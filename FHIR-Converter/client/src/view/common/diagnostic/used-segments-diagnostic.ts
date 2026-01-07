/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License in the project root for license information.
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
import localize from '../../../i18n/localize';

export const diagnosticsCollection = vscode.languages.createDiagnosticCollection('vscode-fhir-liquid-converter.unusedSegments');

interface IDiagnosticComponent {
	range: vscode.Range;
	value: string;
}

export function updateDiagnostics(uri: vscode.Uri, unusedSegments: object[]): void {
	const diagnostics: vscode.Diagnostic[] = [];
	const components = getComponentsList(unusedSegments);
	for (let i = 0; i < components.length; i++) {
		diagnostics.push(createWarningDiagnostic(components[i]));
	}
	diagnosticsCollection.set(uri, diagnostics);
}

export function getComponentsList(unusedSegments: object[]): IDiagnosticComponent[] {
	const result: IDiagnosticComponent[] = [];
	if (!unusedSegments) {
		return result;
	}
	for (let i = 0; i < unusedSegments.length; i++) {
		const line = unusedSegments[i]['Line'];
		const components = unusedSegments[i]['Components'];
		if (line !== undefined && components !== undefined) {
			for (let j = 0; j < components.length; j++) {
				const start = components[j]['Start'];
				const end = components[j]['End'];
				const value = components[j]['Value'];
				if (start !== undefined && end !== undefined && value !== undefined) {
					const range = new vscode.Range(line, start, line, end);
					result.push({range, value});
				}
			}
		}
	}
	return result;
}

export function createWarningDiagnostic(component: IDiagnosticComponent): vscode.Diagnostic {
	const diagnostic = new vscode.Diagnostic(component.range, localize('message.unusedSegment', component.value),
		vscode.DiagnosticSeverity.Warning);
	return diagnostic;
}

export function clearDiagnostics() {
	diagnosticsCollection.clear();
}
