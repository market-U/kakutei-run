/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMMENTS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
