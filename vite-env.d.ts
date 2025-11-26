/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DROPBOX_APP_SECRET: string
    readonly VITE_GEMINI_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
