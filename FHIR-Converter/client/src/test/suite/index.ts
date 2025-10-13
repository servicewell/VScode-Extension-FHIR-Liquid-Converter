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

import * as glob from 'glob';
import * as Mocha from 'mocha';
import { join } from 'path';
import './test-hooks';

function setupCoverage() {
	const NYC = require('nyc');
	const nyc = new NYC({
		cwd: join(__dirname, '..', '..', '..'),
		exclude: ['**/test/**', '.vscode-test/**'],
		reporter: ['text', 'html', 'text-summary'],
		all: true,
		instrument: true,
		hookRequire: true,
		hookRunInContext: true,
		hookRunInThisContext: true,
	});

	nyc.reset();
	nyc.wrap();

	return nyc;
}

export async function run(): Promise<void> {
	const nyc = setupCoverage();

	const mochaOpts = {
		timeout: 10 * 1000,
		ui: 'tdd',
		...JSON.parse(process.env.PWA_TEST_OPTIONS || '{}'),
	};	

	const logTestReporter = join(__dirname, '../reporters/logTestReporter');

	mochaOpts.reporter = 'mocha-multi-reporters';
	mochaOpts.reporterOptions = {
	reporterEnabled: logTestReporter,
  };

	const runner = new Mocha(mochaOpts);

	runner.options.useColors = true;
	runner.addFile(join(__dirname, './view/extension.test'));
	runner.addFile(join(__dirname, './converter/converter.test'));
	runner.addFile(join(__dirname, './converter/engine/fhir-converter-engine.test'));

	const options = { cwd: __dirname };
	const files = glob.sync('**/*utils.test.js', options);

	for (const file of files) {
		runner.addFile(join(__dirname, file));
	}

	try {
		await new Promise<void>((resolve, reject) =>
			runner.run(failures =>
			failures ? reject(new Error(`${failures} tests failed`)) : resolve(undefined),
			),
	);
	} finally {
		if (nyc) {
			nyc.writeCoverageFile();
			await nyc.report();
		}
	}
}
