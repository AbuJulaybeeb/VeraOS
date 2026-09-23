interface Env {
  STELLAR_NETWORK?: string;
  STELLAR_RPC_URL?: string;
  STELLAR_HORIZON_URL?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
}

export const onRequestGet = async ({ env }: { env: Env }) => {
  const token = env.TELEGRAM_BOT_TOKEN || "8989264156:AAGOcGNgV83w3rt5jIMpq-kErxdCHAK-P2c";
  return new Response(
    JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "0.2.0",
      runtime: "cloudflare-pages",
      telegram: {
        configured: Boolean(token),
        polling: false,
        webhookEnabled: true,
        botUsername: "@VeraOS_Layer_bot",
      },
      stellar: {
        network: env.STELLAR_NETWORK || "testnet",
        rpcUrl: env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org",
        horizonUrl: env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org",
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
