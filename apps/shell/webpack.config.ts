import { composePlugins, withNx } from '@nx/webpack';
import { withReact } from '@nx/react';
import { withModuleFederation } from '@nx/module-federation/webpack.js';
import { ModuleFederationConfig } from '@nx/module-federation';

import baseConfig from './module-federation.config';

const config: ModuleFederationConfig = {
  ...baseConfig,
};

// Nx plugins for webpack to build config object from Nx options and context.
/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(config, { dts: false }),
  (webpackConfig) => ({
    ...webpackConfig,
    watchOptions: {
      ...(webpackConfig.watchOptions ?? {}),
      // Prevent "EMFILE: too many open files, watch" on macOS by using polling.
      // This only affects dev watching; production builds are not impacted.
      poll: 1000,
      aggregateTimeout: 200,
      ignored: [
        '**/node_modules/**',
        '**/.nx/**',
        '**/dist/**',
        '**/out-tsc/**',
        '**/.git/**',
      ],
    },
    devServer: {
      ...webpackConfig.devServer,
      historyApiFallback: {
        index: '/index.html',
        disableDotRule: true,
        htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
      },
    },
  }),
);
