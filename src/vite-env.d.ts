/// <reference types="vite/client" />

/**
 * TypeScript declarations for Vite's special import suffixes.
 * @see https://vitejs.dev/guide/assets.html#importing-asset-as-string
 */

// Declaration for ?raw imports - returns the file content as a string
declare module '*?raw' {
  const content: string;
  export default content;
}

// Declaration for ?url imports - returns the URL to the asset
declare module '*?url' {
  const url: string;
  export default url;
}
