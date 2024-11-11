// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3002/api',
  // apiBaseUrl: 'http://10.0.2.2:3002/api',
  // ng serve --host 0.0.0.0 --port 4200

  successUrl: 'http://localhost:4200/home/account_overview?status=success',
  cancelUrl: 'http://localhost:4200/home/account_overview?status=failure'

};

