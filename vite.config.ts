try {
  process.loadEnvFile?.();
} catch {
  // Ignore if .env is missing
}

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { handleApiRequest } from './server/api/routes.ts'
import { veraTelegramBot } from './server/telegram/bot.ts'

function veraBackendPlugin(): Plugin {
  let isInitialized = false
  return {
    name: 'vera-backend-plugin',
    configureServer(server) {
      if (!isInitialized) {
        isInitialized = true
        const token = process.env.TELEGRAM_BOT_TOKEN
        if (token && !veraTelegramBot.isPollingActive()) {
          veraTelegramBot.setBotToken(token.trim())
          veraTelegramBot.setApiBaseUrl('http://localhost:5173')
          veraTelegramBot.startPolling()
        }
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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
    plugins: [react(), veraBackendPlugin()],
  }
})

