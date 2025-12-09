/*!
 * Batch convert a folder of input data to FHIR using the bundled engine.
 */

import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as engineConstants from '../../core/common/constants/engine';
import * as configurationConstants from '../../core/common/constants/workspace-configuration';
import * as stateConstants from '../../core/common/constants/workspace-state';
import * as stringUtils from '../../core/common/utils/string-utils';
import { checkCreateFolders } from '../../core/common/utils/file-utils';
import { ConversionError } from '../../core/common/errors/conversion-error';
import { globals } from '../../core/globals';
import { logChannel } from '../../extension';

export async function batchConvertCommand(uri?: vscode.Uri) {
	logChannel.show(true);
	try {
		const templateFolder: string | undefined = globals.settingManager.getWorkspaceState(configurationConstants.TemplateFolderKey);
		const rootTemplate: string | undefined = globals.settingManager.getWorkspaceState(stateConstants.TemplateKey);
		let resultFolder: string | undefined = globals.settingManager.getWorkspaceConfiguration(configurationConstants.ResultFolderKey);

		if (!templateFolder || !fs.existsSync(templateFolder)) {
			throw new ConversionError('Template folder is not set or does not exist. Select a template first.');
		}
		if (!rootTemplate || !fs.existsSync(rootTemplate)) {
			throw new ConversionError('Root template is not set or does not exist. Select a template first.');
		}

		if (!resultFolder) {
			resultFolder = 'flc-generated';
		}
		checkCreateFolders(resultFolder);

		let sourceFolder: string | undefined = uri?.fsPath;
		if (!sourceFolder) {
			const picked = await vscode.window.showOpenDialog({
				canSelectFiles: false,
				canSelectFolders: true,
				canSelectMany: false,
				openLabel: 'Select input folder for batch convert'
			});
			sourceFolder = picked?.[0]?.fsPath;
		}
		if (!sourceFolder || !fs.existsSync(sourceFolder)) {
			throw new ConversionError('No input folder selected or it does not exist.');
		}

		const targetPick = await vscode.window.showOpenDialog({
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false,
			openLabel: 'Select output folder for batch convert'
		});
		const targetFolder = targetPick?.[0]?.fsPath;
		if (!targetFolder) {
			throw new ConversionError('No output folder selected.');
		}
		checkCreateFolders(targetFolder);

		const rootTemplateName = stringUtils.getRelativePathWithoutExt(templateFolder, rootTemplate);
		const cmdParts = [
			'convert',
			'-d', stringUtils.addQuotes(templateFolder),
			'-r', stringUtils.addQuotes(rootTemplateName),
			'-i', stringUtils.addQuotes(sourceFolder),
			'-o', stringUtils.addQuotes(targetFolder),
			'-t'
		];

		const cmd = `${engineConstants.DefaultEngineExecCmd} ${cmdParts.join(' ')}`;
		logChannel.appendLine(`Running batch convert: ${cmd}`);

		cp.execSync(cmd, { cwd: engineConstants.DefaultEngineFolder, stdio: 'inherit' });
		vscode.window.showInformationMessage(`Batch conversion completed. Output: ${targetFolder}`);
		logChannel.appendLine(`Batch conversion completed. Output: ${targetFolder}`);
	} catch (err: any) {
		const msg = err?.message ?? String(err);
		vscode.window.showErrorMessage(`Batch conversion failed: ${msg}`);
		logChannel.appendLine(`Batch conversion failed: ${msg}`);
	}
}
