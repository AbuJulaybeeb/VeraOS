try {
  process.loadEnvFile?.();
} catch {
  // Ignore if .env is missing
}

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { handleApiRequest } from './server/api/routes.ts'
import { veraTelegramBot } from './server/telegram/bot.ts'

import dns from 'node:dns'
try {
  dns?.setDefaultResultOrder?.('ipv4first')
  process.loadEnvFile?.()
} catch {}

function veraBackendPlugin(): Plugin {
  let isInitialized = false
  return {
    name: 'vera-backend-plugin',
    configureServer(server) {
      const initBot = () => {
        if (isInitialized) return
        const token = process.env.TELEGRAM_BOT_TOKEN
        if (!token) return

        const addr = server.httpServer?.address()
        let port = 5173
        if (addr && typeof addr === 'object' && addr.port) {
          port = addr.port
        }
        const activeUrl = `http://localhost:${port}`
        veraTelegramBot.setBotToken(token.trim())
        veraTelegramBot.setApiBaseUrl(activeUrl)
        if (!veraTelegramBot.isPollingActive()) {
          isInitialized = true
          veraTelegramBot.startPolling()
        }
      }

      if (server.httpServer?.listening) {
        initBot()
      } else {
        server.httpServer?.once('listening', initBot)
      }

      const cleanup = () => {
        veraTelegramBot.stopPolling()
      }

      server.httpServer?.once('close', cleanup)
      server.httpServer?.once('error', cleanup)
      process.once('SIGINT', cleanup)
      process.once('SIGTERM', cleanup)

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

