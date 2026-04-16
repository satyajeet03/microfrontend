# Nx React Microfrontend

This workspace contains a React microfrontend setup built with Nx and Webpack Module Federation.

## Apps

- `shell`: host application on `http://localhost:4200`
- `products`: federated remote on `http://localhost:4201`

## Run locally

```sh
npm install --legacy-peer-deps
npm run start
```

`npm run start` launches the host and its configured remote for local development.

## Useful commands

```sh
npm run start:products
npm run build
npm run add:remote -- complaints
npx nx show project shell
npx nx show project products
```

`npm run add:remote -- complaints` generates a new webpack module-federation remote under `apps/complaints`, connects it to `shell`, and fixes the remote build output path automatically.

## Federation wiring

- Host config: `apps/shell/module-federation.config.ts`
- Remote config: `apps/products/module-federation.config.ts`
- Remote exposure: `products/Module` -> `apps/products/src/remote-entry.ts`
