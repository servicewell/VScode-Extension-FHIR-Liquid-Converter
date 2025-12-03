/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License in the project root for license information.
 */

import TelemetryReporter from 'vscode-extension-telemetry';
import * as vscode from 'vscode';

// Simple fallback reporter so dispose/telemetry calls are always safe
class NullTelemetryReporter {
	sendTelemetryEvent(): void { /* noop */ }
	dispose(): void { /* noop */ }
}

export let reporter: TelemetryReporter | NullTelemetryReporter = new NullTelemetryReporter();

export class Reporter extends vscode.Disposable {
	constructor(ctx: vscode.ExtensionContext) {
		const packageInfo = getPackageInfo(ctx);
		reporter = packageInfo
			? new TelemetryReporter(packageInfo.name, packageInfo.version, packageInfo.aiKey)
			: new NullTelemetryReporter();

		super(() => reporter.dispose());
	}
}

interface IPackageInfo {
	name: string;
	version: string;
	aiKey: string;
}

function getPackageInfo(context: vscode.ExtensionContext): IPackageInfo {
	const extensionPackage = require(context.asAbsolutePath('./package.json'));
	if (extensionPackage) {
		return { name: extensionPackage.name, version: extensionPackage.version, aiKey: extensionPackage.aiKey };
	}
	return;
}
