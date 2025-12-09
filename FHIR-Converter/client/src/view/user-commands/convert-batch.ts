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

		await normalizeOutputFiles(targetFolder);
		const sourceTag = path.relative(workspacePath, sourceFolder) || path.basename(sourceFolder);
		await updateSushiConfig(targetFolder, rootTemplate, workspacePath, sourceTag);

		vscode.window.showInformationMessage(`Batch conversion completed. Output: ${targetFolder}`);
		logChannel.appendLine(`Batch conversion completed. Output: ${targetFolder}`);
	} catch (err: any) {
		const msg = err?.message ?? String(err);
		vscode.window.showErrorMessage(`Batch conversion failed: ${msg}`);
		logChannel.appendLine(`Batch conversion failed: ${msg}`);
	}
}

async function updateSushiConfig(outputFolder: string, rootTemplate: string, workspacePath: string, sourceTag: string) {
	try {
		const sushiPath = path.join(workspacePath, 'sushi-config.yaml');
		if (!fs.existsSync(sushiPath)) {
			logChannel.appendLine('sushi-config.yaml not found; skipping resources update.');
			return;
		}

		const sushiText = fs.readFileSync(sushiPath, 'utf-8');
		const autoResources: Record<string, any> = {};

		const files = fs.readdirSync(outputFolder).filter(f => f.toLowerCase().endsWith('.json'));
		for (const file of files) {
			const fullPath = path.join(outputFolder, file);
			try {
				const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
				const resource = content.FhirResource ?? content;
				const resourceType = resource.resourceType || 'Resource';
				const id = resource.id || path.parse(file).name;
				const key = `${resourceType}/${id}`;
				const name = path.parse(file).name;
				const description = `Generated from template ${path.basename(rootTemplate)}`;
				autoResources[key] = {
					name,
					description,
					exampleBoolean: true
				};
			} catch (err) {
				logChannel.appendLine(`Failed to add ${file} to sushi-config.yaml: ${err}`);
			}
		}

		if (Object.keys(autoResources).length === 0) {
			logChannel.appendLine('No resources to add to sushi-config.yaml.');
			return;
		}

		const autoYaml = yamlDump(autoResources).trimEnd();
		const replaced = replaceResourcesBlockWithMarkers(sushiText, autoYaml, sourceTag);
		fs.writeFileSync(sushiPath, replaced, 'utf-8');
		logChannel.appendLine(`Updated sushi-config.yaml with ${files.length} resources.`);
	} catch (err: any) {
		logChannel.appendLine(`Failed to update sushi-config.yaml: ${err?.message ?? err}`);
	}
}

async function normalizeOutputFiles(outputFolder: string) {
	const files = fs.readdirSync(outputFolder).filter(f => f.toLowerCase().endsWith('.json'));
	for (const file of files) {
		const fullPath = path.join(outputFolder, file);
		try {
			const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
			if (raw && raw.FhirResource) {
				fs.writeFileSync(fullPath, JSON.stringify(raw.FhirResource, null, 2), 'utf-8');
				logChannel.appendLine(`Normalized wrapped output to pure FHIR JSON: ${file}`);
			}
		} catch (err) {
			logChannel.appendLine(`Failed to normalize ${file}: ${err}`);
		}
	}
}

function replaceResourcesBlock(original: string, resourcesYaml: string): string {
	// Deprecated: kept for reference; not used
	return original;
}

function replaceResourcesBlockWithMarkers(original: string, autoYaml: string, tag: string): string {
	const startMarker = `# FLC AUTO START ${tag}`;
	const endMarker = `# FLC AUTO END ${tag}`;
	const lines = original.split(/\r?\n/);

	let resourcesStart = -1;
	let resourcesEnd = lines.length;
	for (let i = 0; i < lines.length; i++) {
		if (/^resources:\s*$/.test(lines[i])) {
			resourcesStart = i;
			break;
		}
	}
	if (resourcesStart !== -1) {
		for (let j = resourcesStart + 1; j < lines.length; j++) {
			if (/^[^\s#]/.test(lines[j])) {
				resourcesEnd = j;
				break;
			}
		}
	}

	// Detect existing markers
	let autoStart = lines.findIndex(l => l.trim() === startMarker);
	let autoEnd = lines.findIndex(l => l.trim() === endMarker);

	// Indent helper
	const indent = (s: string, spaces = 2) => s.split(/\r?\n/).map(l => ' '.repeat(spaces) + l).join('\n');
	const autoBlock = [startMarker, indent(autoYaml), endMarker].join('\n');

	if (autoStart !== -1 && autoEnd > autoStart) {
		// Replace existing auto block
		const before = lines.slice(0, autoStart).join('\n');
		const after = lines.slice(autoEnd + 1).join('\n');
		return [before, autoBlock, after].filter(Boolean).join('\n');
	}

	if (resourcesStart !== -1) {
		// Insert inside resources block at the end
		const before = lines.slice(0, resourcesEnd).join('\n');
		const after = lines.slice(resourcesEnd).join('\n');
		const insertion = indent(autoBlock);
		return [before, insertion, after].filter(Boolean).join('\n');
	}

	// No resources block at all; create one
	return ['resources:', indent(autoBlock), original.trimEnd()].filter(Boolean).join('\n') + '\n';
}
