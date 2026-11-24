import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Adresa backendului NestJS. Se poate schimba prin variabila de mediu API_URL.
const apiUrl = process.env.API_URL ?? 'http://localhost:3000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy: cererile browserului către /api/... ajung la serverul Vite,
    // care le trimite mai departe backendului. Pentru browser totul vine
    // de la aceeași adresă (aceeași origine), deci nu apar erori CORS.
    proxy: {
      '/api': apiUrl,
    },
  },
})
