import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const [, , remoteName] = process.argv;

if (!remoteName) {
  console.error('Usage: npm run add:remote -- <remote-name>');
  process.exit(1);
}

if (!/^[a-z][a-z0-9-]*$/.test(remoteName)) {
  console.error(
    'Remote name must start with a lowercase letter and contain only lowercase letters, numbers, or hyphens.',
  );
  process.exit(1);
}

const appPath = `apps/${remoteName}`;
const packageJsonPath = join(process.cwd(), appPath, 'package.json');
const moduleRegistryPath = join(
  process.cwd(),
  'apps/shell/src/assets/module-registry.json',
);
const shellAppPath = join(process.cwd(), 'apps/shell/src/app/app.tsx');

if (existsSync(packageJsonPath)) {
  console.error(`Remote "${remoteName}" already exists at ${appPath}.`);
  process.exit(1);
}

const nxArgs = [
  'nx',
  'g',
  '@nx/react:remote',
  appPath,
  `--name=${remoteName}`,
  '--host=shell',
  '--bundler=webpack',
  '--style=css',
  '--unitTestRunner=none',
  '--e2eTestRunner=none',
  '--skipFormat',
];

const generateResult = spawnSync('npx', nxArgs, {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: false,
});

if (generateResult.status !== 0) {
  process.exit(generateResult.status ?? 1);
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const remotePort = packageJson.nx?.targets?.serve?.options?.port;

if (packageJson.nx?.targets?.build?.options) {
  packageJson.nx.targets.build.options.outputPath = `dist/apps/${remoteName}`;
}

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

const moduleRegistry = JSON.parse(readFileSync(moduleRegistryPath, 'utf8'));
const remoteEntry = `http://localhost:${remotePort}/remoteEntry.js`;

if (!moduleRegistry.modules.some((module) => module.id === remoteName)) {
  moduleRegistry.modules.push({
    id: remoteName,
    displayName: toPascalCase(remoteName),
    routePath: `/${remoteName}`,
    remoteName,
    entry: remoteEntry,
    exposedModule: 'Module',
    source: 'workspace',
    enabled: true,
    stateCodes: [],
  });

  writeFileSync(
    moduleRegistryPath,
    `${JSON.stringify(moduleRegistry, null, 2)}\n`,
  );
}

const shellAppSource = readFileSync(shellAppPath, 'utf8');
const cleanedShellAppSource = shellAppSource
  .replace(
    new RegExp(
      `\\nconst ${toPascalCase(remoteName)} = React\\.lazy\\(\\(\\) => import\\('${remoteName}\\/Module'\\)\\);\\n`,
    ),
    '\n',
  )
  .replace(
    new RegExp(
      `\\n<Link to=\"\\/${remoteName}\">${toPascalCase(remoteName)}<\\/Link>`,
    ),
    '',
  )
  .replace(
    new RegExp(
      `\\n<Route path=\"\\/${remoteName}\" element={<${toPascalCase(remoteName)} \\/>} \\/>`,
    ),
    '',
  );

if (cleanedShellAppSource !== shellAppSource) {
  writeFileSync(shellAppPath, cleanedShellAppSource);
}

spawnSync('npx', ['prettier', '--write', packageJsonPath], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: false,
});

spawnSync('npx', ['prettier', '--write', moduleRegistryPath, shellAppPath], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: false,
});

console.log('');
console.log(`Remote "${remoteName}" created.`);
console.log(`Next steps:`);
console.log(`1. Start the app with: npm run start`);
console.log(`2. Open: http://localhost:4200/${remoteName}`);

function toPascalCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
