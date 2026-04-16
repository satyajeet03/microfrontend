import { Route, Routes, useLocation } from 'react-router-dom';
import styles from './app.module.css';
import { Header, Sidebar } from './layout';
import {
  getEnabledModules,
  normalizeRoutePath,
  type PortalModuleConfig,
} from '../module-registry';

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

function DynamicModuleTextRoute({ modules }: { modules: PortalModuleConfig[] }) {
  const location = useLocation();
  const routePath = normalizeRoutePath(location.pathname);
  const matchedModule = modules.find(
    (module) => isRouteMatch(module, routePath),
  );

  if (!matchedModule) {
    return <UnknownModule routePath={routePath} />;
  }

  return (
    <section className={styles.message}>
      <span className={styles.kicker}>Selected module</span>
      <h2>{matchedModule.displayName}</h2>
      <p>
        You clicked <code>{matchedModule.routePath}</code>. This is a simple
        module placeholder render.
      </p>
    </section>
  );
}

export function App() {
  const stateCode = getStateCodeFromQueryOrStorage();
  const modules = getEnabledModules(stateCode);

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
                <p>
                  Clicking a module route now renders simple text for that
                  module.
                </p>
              </section>
            }
          />
          <Route path="*" element={<DynamicModuleTextRoute modules={modules} />} />
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
