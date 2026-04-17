const { exec } = require('child_process');
const fs = require('fs');

const registry = JSON.parse(
  fs.readFileSync('./apps/shell/src/assets/module-registry.json', 'utf-8')
);

const enabledModules = registry.modules
  .filter((m) => m.enabled && m.source === 'workspace')
  .map((m) => m.remoteName);

const projects = ['shell', ...enabledModules].join(',');

const cmd = `nx run-many --target=serve --projects=${projects} --parallel`;

console.log('🚀 Starting:', projects);

exec(cmd, (err, stdout, stderr) => {
  if (err) console.error(err);
  console.log(stdout);
});