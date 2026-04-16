import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app/app';
import { loadModuleRegistry } from './module-registry';

async function bootstrap() {
  await loadModuleRegistry();

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
  );
  root.render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap shell', error);

  const rootElement = document.getElementById('root');

  if (rootElement) {
    rootElement.innerHTML =
      '<div style="padding:24px;font-family:Segoe UI,sans-serif">Failed to load the module registry.</div>';
  }
});
