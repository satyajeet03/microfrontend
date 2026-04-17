import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'complaints',

  exposes: {
    './Module': './src/remote-entry.ts',  
  },

  shared: (lib, defaultConfig) => { 
    if (lib === 'react' || lib === 'react-dom') {
      return {
        ...defaultConfig,
        singleton: true,
        strictVersion: true,
        requiredVersion: 'auto',
      };
    }
 
    if (lib.startsWith('@your-org/')) {
      return {
        ...defaultConfig,
        singleton: true,
      };
    }

    return defaultConfig;
  },
}; 
export default config;