import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const registryPath = resolve(
  process.cwd(),
  'apps/shell/src/assets/module-registry.json',
);
const schemaPath = resolve(process.cwd(), 'tools/module-registry.schema.json');

const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
JSON.parse(readFileSync(schemaPath, 'utf8'));

const errors = [];

if (!registry || typeof registry !== 'object') {
  fail('Registry must be a JSON object.');
}

if (!Array.isArray(registry.modules) || registry.modules.length === 0) {
  fail('"modules" must be a non-empty array.');
}

const idSet = new Set();
const routeSet = new Set();
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const routePattern = /^\/[a-z0-9-]*(?:\/[a-z0-9-]+)*$/;
const remoteNamePattern = /^[A-Za-z][A-Za-z0-9]*$/;
const entryPattern = /^https?:\/\/[^\s]+remoteEntry\.js$/;
const exposedModulePattern = /^(\.?\/?[A-Za-z0-9_-]+)$/;

registry.modules.forEach((module, index) => {
  const pointer = `modules[${index}]`;
  const requiredFields = [
    'id',
    'displayName',
    'routePath',
    'remoteName',
    'entry',
    'exposedModule',
    'source',
    'enabled',
    'stateCodes',
  ];

  requiredFields.forEach((field) => {
    if (!(field in module)) {
      errors.push(`${pointer}: missing required field "${field}"`);
    }
  });

  if (!idPattern.test(module.id ?? '')) {
    errors.push(
      `${pointer}.id must be kebab-case (e.g. "general-diary"), got "${module.id}"`,
    );
  }

  if (!routePattern.test(module.routePath ?? '')) {
    errors.push(
      `${pointer}.routePath must start with "/" and use lowercase path segments.`,
    );
  }

  if (!remoteNamePattern.test(module.remoteName ?? '')) {
    errors.push(
      `${pointer}.remoteName must be alphanumeric and start with a letter.`,
    );
  }

  if (!entryPattern.test(module.entry ?? '')) {
    errors.push(
      `${pointer}.entry must be a valid http(s) URL ending with "remoteEntry.js".`,
    );
  }

  if (!exposedModulePattern.test(module.exposedModule ?? '')) {
    errors.push(
      `${pointer}.exposedModule must be in the form "Module" or "./Module".`,
    );
  }

  if (!['workspace', 'external'].includes(module.source)) {
    errors.push(`${pointer}.source must be "workspace" or "external".`);
  }

  if (module.matchMode && !['exact', 'prefix'].includes(module.matchMode)) {
    errors.push(`${pointer}.matchMode must be "exact" or "prefix".`);
  }

  if (typeof module.enabled !== 'boolean') {
    errors.push(`${pointer}.enabled must be boolean.`);
  }

  if (!Array.isArray(module.stateCodes)) {
    errors.push(`${pointer}.stateCodes must be an array.`);
  } else {
    module.stateCodes.forEach((code, codeIndex) => {
      if (!/^[A-Z]{2}$/.test(code)) {
        errors.push(
          `${pointer}.stateCodes[${codeIndex}] must be 2-letter uppercase code.`,
        );
      }
    });
  }

  if (idSet.has(module.id)) {
    errors.push(`${pointer}.id "${module.id}" is duplicated.`);
  }
  idSet.add(module.id);

  if (routeSet.has(module.routePath)) {
    errors.push(`${pointer}.routePath "${module.routePath}" is duplicated.`);
  }
  routeSet.add(module.routePath);
});

if (errors.length > 0) {
  console.error('Module registry validation failed:\n');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Registry validation passed for ${registry.modules.length} modules.`);

function fail(message) {
  console.error(`Module registry validation failed: ${message}`);
  process.exit(1);
}
