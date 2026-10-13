/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_AUTH_BASE_URL?: string;
  readonly VITE_USE_MOCK?: string;
  readonly VITE_VERSION?: string;
  readonly VITE_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
