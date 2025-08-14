// Environment configuration for Vite
interface ImportMetaEnv {
  readonly VITE_MODULE_ADDR: string;
  readonly VITE_NODE_URL: string;
  readonly VITE_WEB3_STORAGE_TOKEN: string;
  readonly VITE_DEV_MODE: string;
  readonly VITE_NETWORK: string;
  readonly VITE_IPFS_GATEWAY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
