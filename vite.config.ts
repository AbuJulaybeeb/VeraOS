import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { handleApiRequest } from './server/api/routes.ts'
import { veraTelegramBot } from './server/telegram/bot.ts'

function veraBackendPlugin(): Plugin {
  return {
    name: 'vera-backend-plugin',
    configureServer(server) {
      if (process.env.TELEGRAM_BOT_TOKEN && !veraTelegramBot.isPollingActive()) {
        veraTelegramBot.setApiBaseUrl('http://localhost:5173')
        veraTelegramBot.startPolling()
      }

      server.httpServer?.on('close', () => {
        veraTelegramBot.stopPolling()
      })

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

