const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const shared = {
	bundle: true,
	platform: 'node',
	format: 'cjs',
	target: 'node20',
	external: ['vscode'], // VS Code provides this at runtime
	sourcemap: true,
	logLevel: 'info',
};

async function build() {
	await esbuild.build({
		...shared,
		entryPoints: ['client/src/extension.ts'],
		outfile: 'dist/extension.js',
	});

	await esbuild.build({
		...shared,
		entryPoints: ['server/src/server.ts'],
		outfile: 'dist/server.js',
	});

	// Ensure sql.js WASM is available at runtime for goFSH/JSON->FSH flow
	const wasmSrc = path.resolve(__dirname, '../client/node_modules/sql.js/dist/sql-wasm.wasm');
	const wasmDst = path.resolve(__dirname, '../dist/sql-wasm.wasm');
	fs.copyFileSync(wasmSrc, wasmDst);
}

build().catch((err) => {
	console.error(err);
	process.exit(1);
});
