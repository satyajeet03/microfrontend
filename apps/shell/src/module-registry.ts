import { init, registerRemotes } from '@module-federation/enhanced/runtime';

export type PortalModuleConfig = {
  id: string;
  displayName: string;
  routePath: string;
  remoteName: string;
  entry: string;
  exposedModule: string;
  source: 'workspace' | 'external';
  enabled: boolean;
  stateCodes: string[];
  matchMode?: 'exact' | 'prefix';
};

type ModuleRegistryResponse = {
  modules: PortalModuleConfig[];
};

let registryCache: PortalModuleConfig[] = [];
let registryPromise: Promise<PortalModuleConfig[]> | null = null;
let runtimeInitialized = false;
const MODULE_REGISTRY_FALLBACK_PATH = '/assets/module-registry.json';
const MODULE_REGISTRY_API_PATH = '/api/module-registry';

export async function loadModuleRegistry() {
  if (registryPromise) {
    return registryPromise;
  }

  registryPromise = loadRegistryPayload()
    .then((payload) => {
      const modules = normalizeModules(payload.modules ?? []);
      initializeFederationRuntime(modules);
      registryCache = modules;
      return modules;
    })
    .catch((error) => {
      registryPromise = null;
      throw error;
    });

  return registryPromise;
}

export function getModuleRegistry() {
  return registryCache;
}

export function getEnabledModules(stateCode?: string) {
  const normalizedState = stateCode?.trim().toUpperCase();

  return registryCache.filter((module) => {
    if (!module.enabled) {
      return false;
    }

    if (!normalizedState || module.stateCodes.length === 0) {
      return true;
    }

    return module.stateCodes.some((code) => code === normalizedState);
  });
}

export function normalizeRoutePath(routePath: string) {
  if (!routePath || routePath === '/') {
    return '/';
  }

  return routePath.endsWith('/') ? routePath.slice(0, -1) : routePath;
}

async function loadRegistryPayload(): Promise<ModuleRegistryResponse> {
  const primaryResponse = await fetch(MODULE_REGISTRY_API_PATH);

  if (primaryResponse.ok) {
    return (await primaryResponse.json()) as ModuleRegistryResponse;
  }

  const fallbackResponse = await fetch(MODULE_REGISTRY_FALLBACK_PATH);

  if (!fallbackResponse.ok) {
    throw new Error(
      `Failed to load module registry from both ${MODULE_REGISTRY_API_PATH} and ${MODULE_REGISTRY_FALLBACK_PATH}.`,
    );
  }

  return (await fallbackResponse.json()) as ModuleRegistryResponse;
}

function normalizeModules(modules: PortalModuleConfig[]) {
  const uniqueModules = new Map<string, PortalModuleConfig>();

  for (const module of modules) {
    if (
      !module.id ||
      !module.routePath ||
      !module.remoteName ||
      !module.entry ||
      !module.exposedModule
    ) {
      continue;
    }

    uniqueModules.set(module.id, {
      ...module,
      routePath: normalizeRoutePath(module.routePath),
      matchMode: module.matchMode ?? 'exact',
      stateCodes: (module.stateCodes ?? []).map((code) =>
        code.trim().toUpperCase(),
      ),
    });
  }

  return Array.from(uniqueModules.values());
}

function initializeFederationRuntime(modules: PortalModuleConfig[]) {
  if (runtimeInitialized) {
    return;
  }

 init({
  name: 'shell',
  remotes: [], // start empty
});

  runtimeInitialized = true;
}
const registeredRemotes = new Set<string>();

export function ensureRemoteRegistered(module: PortalModuleConfig) {
  if (registeredRemotes.has(module.remoteName)) {
    return;
  }

  registerRemotes([
    {
      name: module.remoteName,
      entry: module.entry,
    },
  ]);

  registeredRemotes.add(module.remoteName);

  console.log(
    '%c[Shell] 🔌 Remote registered:',
    'color:#22c55e',
    module.remoteName
  );
}