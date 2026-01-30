import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  server: {
    https: true,
    host: true, // so LAN devices can reach it
  },
  plugins: [mkcert()],
});