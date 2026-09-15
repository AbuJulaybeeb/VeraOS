import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { handleApiRequest } from './server/api/routes.ts'

function veraBackendPlugin(): Plugin {
  return {
    name: 'vera-backend-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleApiRequest(req, res)
          if (!handled) {
            next()
          }
        } catch (err) {
          next(err)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), veraBackendPlugin()],
})

