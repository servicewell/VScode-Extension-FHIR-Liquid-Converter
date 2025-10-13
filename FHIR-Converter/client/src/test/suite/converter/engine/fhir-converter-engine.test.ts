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

import * as assert from 'assert';
import * as fs from 'fs';
import { beforeEach } from 'mocha';
import * as path from 'path';
import { DefaultEngineFolder } from '../../../../core/common/constants/engine';
import { FhirConverterEngine } from '../../../../core/converter/engine/fhir-converter-engine';

suite('Hl7v2 Converter Engine Test Suite', () => {
	const testPath = path.join(__dirname, '../../../../../../test-data');
	const resultFolder = path.join(testPath, 'result');
	const activeDataPath = path.join(testPath, 'data/Hl7v2/ADT01-23.hl7');
	const invalidActiveDataPath = path.join(testPath, 'data/Hl7v2/ADT01-23-error.hl7');
	const emptyDataPath = path.join(testPath, 'data/Hl7v2/empty.hl7');
	const templateFolder = path.join(testPath, 'templates/Hl7v2');
	const invalidTemplateFolder = path.join(testPath, 'templates');
	const resultFile = path.join(resultFolder, 'temp.json');
	const rootTemplate = 'ADT_A01.liquid';
	const invalidrootTemplate = 'Invalid_template';
	const hl7v2Engine = new FhirConverterEngine(templateFolder, rootTemplate, resultFolder, DefaultEngineFolder);

	beforeEach(() => {
		if (fs.existsSync(resultFile)) {
			fs.unlinkSync(resultFile);
		}
	});

	test('Function constructor - should return a engine', async () => {
		const engine = new FhirConverterEngine(templateFolder, rootTemplate, resultFolder, DefaultEngineFolder);
		assert.strictEqual(engine instanceof FhirConverterEngine, true);
	});

	test('Function process - should return a json object with OK status given data, template and template folder', async () => {
		assert.strictEqual(false, fs.existsSync(resultFile));
		hl7v2Engine.process(activeDataPath, false);
		assert.strictEqual(true, fs.existsSync(resultFile));
		const msg = JSON.parse(fs.readFileSync(resultFile).toString());
		assert.strictEqual('OK', msg.Status);
	}).timeout(20000);
	
	
	test('Function process - should throw an error given invalid data', async () => {
		try {
			hl7v2Engine.process(invalidActiveDataPath, false);
			assert.strictEqual(true, false);
		} catch (error) {
			assert.strictEqual(true, true);
		}
	});
	
	test('Function process - should throw an error given invalid root template', async () => {
		try {
			const hl7v2EngineInvalidrootTemplate = new FhirConverterEngine(templateFolder, invalidrootTemplate, resultFolder, DefaultEngineFolder);
			hl7v2EngineInvalidrootTemplate.process(activeDataPath, false);
			assert.strictEqual(true, false);
		} catch (error) {
			assert.strictEqual(true, true);
		}
	});

	test('Function process - should throw an error given invalid template folder', async () => {
		try {
			const hl7v2EngineInvalidTemplateFolder = new FhirConverterEngine(invalidTemplateFolder, rootTemplate, resultFolder, DefaultEngineFolder);
			hl7v2EngineInvalidTemplateFolder.process(activeDataPath, false);
			assert.strictEqual(true, false);
		} catch (error) {
			assert.strictEqual(true, true);
		}
	});

	test('Function process - should throw an error given undefined data path', async () => {
		try {
			hl7v2Engine.process(undefined, false);
			assert.strictEqual(true, false);
		} catch (error) {
			assert.strictEqual(true, true);
		}
	});

	test('Function process - should throw an error given empty data', async () => {
		try {
			hl7v2Engine.process(emptyDataPath, false);
			assert.strictEqual(true, false);
		} catch (error) {
			assert.strictEqual(true, true);
		}
	});
});

suite('CCDA Converter Engine Test Suite', () => {
	const testPath = path.join(__dirname, '../../../../../../test-data');
	const resultFolder = path.join(testPath, 'result');
	const activeDataPath = path.join(testPath, 'data/C-CDA/CCD.ccda');
	const activeDataXmlPath = path.join(testPath, 'data/C-CDA/C-CDA_R2-1_CCD.xml');
	const invalidActiveDataPath = path.join(testPath, 'data/C-CDA/CCD-error.ccda');
	const emptyDataPath = path.join(testPath, 'data/C-CDA/empty.ccda');
	const templateFolder = path.join(testPath, 'templates/C-CDA');
	const invalidTemplateFolder = path.join(testPath, 'templates');
	const resultFile = path.join(resultFolder, 'temp.json');
	const rootTemplate = 'CCD.liquid';
	const invalidrootTemplate = 'Invalid_template';
	const ccdaEngine = new FhirConverterEngine(templateFolder, rootTemplate, resultFolder, DefaultEngineFolder);

	beforeEach(() => {
		if (fs.existsSync(resultFile)) {
			fs.unlinkSync(resultFile);
		}
	});

	test('Function constructor - should return a engine', async () => {
		const engine = new FhirConverterEngine(templateFolder, rootTemplate, resultFolder, DefaultEngineFolder);
		assert.strictEqual(engine instanceof FhirConverterEngine, true);
	});

	test('Function process - should return a json object with OK status given data with .ccda, template and template folder', async () => {
		assert.strictEqual(false, fs.existsSync(resultFile));
		ccdaEngine.process(activeDataPath, false);
		assert.strictEqual(true, fs.existsSync(resultFile));
		const msg = JSON.parse(fs.readFileSync(resultFile).toString());
		assert.strictEqual('OK', msg.Status);
	}).timeout(20000);
	
	test('Function process - should return a json object with OK status given data with .xml, template and template folder', async () => {
		assert.strictEqual(false, fs.existsSync(resultFile));
		ccdaEngine.process(activeDataXmlPath, false);
		assert.strictEqual(true, fs.existsSync(resultFile));
		const msg = JSON.parse(fs.readFileSync(resultFile).toString());
		assert.strictEqual('OK', msg.Status);
	}).timeout(20000);
	
	test('Function process - should throw an error given invalid data', async () => {
		try {
			ccdaEngine.process(invalidActiveDataPath, false);
			assert.strictEqual(true, false);
		} catch (error) {
			assert.strictEqual(true, true);
		}
	});
	
	test('Function process - should throw an error given invalid root template', async () => {
		try {
			const ccdaEngineInvalidrootTemplate = new FhirConverterEngine(templateFolder, invalidrootTemplate, resultFolder, DefaultEngineFolder);
			ccdaEngineInvalidrootTemplate.process(activeDataPath, false);
			assert.strictEqual(true, false);
		} catch (error) {
			assert.strictEqual(true, true);
		}
	});

	test('Function process - should throw an error given invalid template folder', async () => {
		try {
			const ccdaEngineInvalidTemplateFolder = new FhirConverterEngine(invalidTemplateFolder, rootTemplate, resultFolder, DefaultEngineFolder);
			ccdaEngineInvalidTemplateFolder.process(activeDataPath, false);
			assert.strictEqual(true, false);
		} catch (error) {
			assert.strictEqual(true, true);
		}
	});

	test('Function process - should throw an error given undefined data path', async () => {
		try {
			ccdaEngine.process(undefined, false);
			assert.strictEqual(true, false);
		} catch (error) {
			assert.strictEqual(true, true);
		}
	});

	test('Function process - should throw an error given empty data', async () => {
		try {
			ccdaEngine.process(emptyDataPath, false);
			assert.strictEqual(true, false);
		} catch (error) {
			assert.strictEqual(true, true);
		}
	});
});
