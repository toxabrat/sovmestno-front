import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAPACITOR_SERVER_URL ?? 'https://sovmestno-test.ru';

const config: CapacitorConfig = {
  appId: 'ru.sovmestno.app',
  appName: 'Sovmestno',
  webDir: 'dist',
  server: {
    url: serverUrl,
    cleartext: false,
  },
};

export default config;
