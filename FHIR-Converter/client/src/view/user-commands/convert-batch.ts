/*!
 * Batch convert a folder of input data to FHIR using the bundled engine.
 */

import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';
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
	logChannel.appendLine('Batch convert started...');
	try {
		const templateFolder: string | undefined = globals.settingManager.getWorkspaceState(configurationConstants.TemplateFolderKey);
		const rootTemplate: string | undefined = globals.settingManager.getWorkspaceState(stateConstants.TemplateKey);

		if (!templateFolder || !fs.existsSync(templateFolder)) {
			throw new ConversionError('Template folder is not set or does not exist. Select a template first.');
		}
		if (!rootTemplate || !fs.existsSync(rootTemplate)) {
			throw new ConversionError('Root template is not set or does not exist. Select a template first.');
		}

		const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
		const sourceFolder: string | undefined = uri?.fsPath;
		if (!sourceFolder || !fs.existsSync(sourceFolder)) {
			throw new ConversionError('No input folder selected or it does not exist.');
		}

		const targetFolder = path.join(workspacePath, 'input', 'resources');
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

		await updateSushiConfig(targetFolder, rootTemplate, workspacePath);

		vscode.window.showInformationMessage(`Batch conversion completed. Output: ${targetFolder}`);
		logChannel.appendLine(`Batch conversion completed. Output: ${targetFolder}`);
	} catch (err: any) {
		const msg = err?.message ?? String(err);
		vscode.window.showErrorMessage(`Batch conversion failed: ${msg}`);
		logChannel.appendLine(`Batch conversion failed: ${msg}`);
	}
}

async function updateSushiConfig(outputFolder: string, rootTemplate: string, workspacePath: string) {
	try {
		const sushiPath = path.join(workspacePath, 'sushi-config.yaml');
		if (!fs.existsSync(sushiPath)) {
			logChannel.appendLine('sushi-config.yaml not found; skipping resources update.');
			return;
		}

		const sushiText = fs.readFileSync(sushiPath, 'utf-8');
		const yamlObj = (yamlLoad(sushiText) as any) || {};
		yamlObj.resources = yamlObj.resources || {};

		const files = fs.readdirSync(outputFolder).filter(f => f.toLowerCase().endsWith('.json'));
		for (const file of files) {
			const fullPath = path.join(outputFolder, file);
			try {
				const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
				const resourceType = content.resourceType || 'Resource';
				const id = content.id || path.parse(file).name;
				const key = `${resourceType}/${id}`;
				const name = path.parse(file).name;
				const description = `Generated from template ${path.basename(rootTemplate)}`;
				yamlObj.resources[key] = yamlObj.resources[key] || {};
				yamlObj.resources[key].name = name;
				yamlObj.resources[key].description = description;
				yamlObj.resources[key].exampleBoolean = true;
			} catch (err) {
				logChannel.appendLine(`Failed to add ${file} to sushi-config.yaml: ${err}`);
			}
		}

		const newResourcesBlock = yamlDump({ resources: yamlObj.resources });
		const replaced = replaceResourcesBlock(sushiText, newResourcesBlock);
		fs.writeFileSync(sushiPath, replaced, 'utf-8');
		logChannel.appendLine(`Updated sushi-config.yaml with ${files.length} resources.`);
	} catch (err: any) {
		logChannel.appendLine(`Failed to update sushi-config.yaml: ${err?.message ?? err}`);
	}
}

function replaceResourcesBlock(original: string, resourcesYaml: string): string {
	const lines = original.split(/\r?\n/);
	let start = -1;
	let end = lines.length;

	for (let i = 0; i < lines.length; i++) {
		if (/^resources:\s*$/.test(lines[i])) {
			start = i;
			break;
		}
	}

	if (start !== -1) {
		for (let j = start + 1; j < lines.length; j++) {
			if (/^[^\s#]/.test(lines[j])) {
				end = j;
				break;
			}
		}
		const before = lines.slice(0, start).join('\n');
		const after = lines.slice(end).join('\n');
		return [before, resourcesYaml.trimEnd(), after].filter(Boolean).join('\n');
	}

	// No existing resources block; append
	return [original.trimEnd(), resourcesYaml.trimEnd()].filter(Boolean).join('\n') + '\n';
}
