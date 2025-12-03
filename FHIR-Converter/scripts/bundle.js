const esbuild = require('esbuild');

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
}

build().catch((err) => {
	console.error(err);
	process.exit(1);
});
