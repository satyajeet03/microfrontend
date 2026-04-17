import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'products',                 
  exposes: {
    './Module': './src/app/app.tsx',   
  },
  shared: (lib, config) => {
  if (['react', 'react-dom'].includes(lib)) {
    return {
      ...config,
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    };
  }

  if (lib.startsWith('@your-org/')) {
    return {
      ...config,
      singleton: true,
    };
  }

  return config;
}
};
 
export default config;