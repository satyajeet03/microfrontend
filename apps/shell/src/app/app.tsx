import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import styles from './app.module.css';
import { Header, Sidebar } from './layout';
import {
  getEnabledModules,
  normalizeRoutePath,
  type PortalModuleConfig,
} from '../module-registry';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { ensureRemoteRegistered } from '../module-registry';
/**
 * Simple Error Boundary so the shell doesn't crash when a remote fails.
 */
class RemoteErrorBoundary extends React.Component<
  { children: React.ReactNode; remoteKey: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; remoteKey: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <section className={styles.message} style={{ color: 'red', border: '2px solid red', padding: '20px' }}>
          <span className={styles.kicker}>❌ Remote Load Error</span>
          <h2>Failed to load module</h2>
          <p>Tried to load: <code>{this.props.remoteKey}</code></p>
          <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
          </p>
          <p><strong>Tip:</strong> Make sure your remote exposes <code>./Module</code> (see instructions below)</p>
        </section>
      );
    }
    return this.props.children;
  }
}

function UnknownModule({ routePath }: { routePath: string }) {
  return (
    <section className={styles.message}>
      <span className={styles.kicker}>Unknown module</span>
      <h2>{routePath}</h2>
      <p>
        This route is not present in your module registry config.
      </p>
    </section>
  );
}

/**
 * NOW LOADS THE REAL REMOTE using the exposedModule from your registry
 */
function DynamicModuleRoute({ modules }: { modules: PortalModuleConfig[] }) {
  const location = useLocation();
  const routePath = normalizeRoutePath(location.pathname);

const matchedModule = modules.find(
  (module) => isRouteMatch(module, routePath)
);

if (!matchedModule) {
  return <UnknownModule routePath={routePath} />;
}
 
ensureRemoteRegistered(matchedModule);
const exposed = matchedModule.exposedModule.startsWith('./')
  ? matchedModule.exposedModule.slice(2)
  : matchedModule.exposedModule;

const remoteKey = `${matchedModule.remoteName}/${exposed}`;

  console.log('%c[Shell] Loading remote →', 'color:#10b981; font-weight:bold', remoteKey);

  const RemoteApp = React.lazy(() =>
    loadRemote(remoteKey)
      .then((module: any) => {
        console.log('%c[Shell] ✅ Remote loaded successfully:', 'color:#10b981', matchedModule.id);
        return {
          default: module.App || module.default,
        };
      })
      .catch((err) => {
        console.error('%c[Shell] ❌ loadRemote FAILED for', 'color:red', remoteKey, err);
        throw err;
      })
  );

  return (
    <React.Suspense
      fallback={
        <section className={styles.message}>
          <span className={styles.kicker}>Loading remote...</span>
          <h2>{matchedModule.displayName}</h2>
          <p>Fetching <code>{remoteKey}</code></p>
        </section>
      }
    >
      <RemoteErrorBoundary remoteKey={remoteKey}>
        <RemoteApp />
      </RemoteErrorBoundary>
    </React.Suspense>
  );
}

export function App() {
  const stateCode = getStateCodeFromQueryOrStorage();
  const modules = getEnabledModules(stateCode);

  console.log('%c[Shell] Enabled modules:', 'color:#3b82f6', modules);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <Header
          title="Citizen Portal"
          subtitle="Common header + sidebar with dynamic module names."
        />
      </header>

      <div className={styles.layout}>
        <Sidebar
          title="Modules"
          items={modules.map((module) => ({
            id: module.id,
            label: module.displayName,
            path: module.routePath,
          }))}
          className={styles.sidebar}
          itemClassName={styles.sidebarLink}
          activeItemClassName={styles.sidebarLinkActive}
        />
        <main className={styles.content}>
          <Routes>
            <Route
              path="/"
              element={
                <section className={styles.message}>
                  <span className={styles.kicker}>Home</span>
                  <h2>Select a module from the sidebar</h2>
                  <p>Real remote modules (Complaints / Products) will now load here.</p>
                </section>
              }
            />
            <Route path="*" element={<DynamicModuleRoute modules={modules} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function isRouteMatch(module: PortalModuleConfig, routePath: string) {
  const moduleRoutePath = normalizeRoutePath(module.routePath);

  if (module.matchMode === 'prefix') {
    return (
      routePath === moduleRoutePath ||
      routePath.startsWith(`${moduleRoutePath}/`)
    );
  }

  return routePath === moduleRoutePath;
}

function getStateCodeFromQueryOrStorage() {
  const query = new URLSearchParams(window.location.search);
  const queryStateCode = query.get('state');

  if (queryStateCode) {
    return queryStateCode;
  }

  return window.localStorage.getItem('portal-state-code') ?? undefined;
}

export default App;