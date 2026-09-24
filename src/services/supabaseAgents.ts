import { supabase, isSupabaseConfigured, DbAgent } from "../lib/supabase";
import { Agent } from "../types/agent";

function mapDbAgentToAgent(db: DbAgent): Agent {
  return {
    id: db.id,
    name: db.name,
    version: "v1.0",
    status: db.connection_status === "CONNECTED" ? "CONNECTED" : db.connection_status === "IDLE" ? "IDLE" : "NOT_CONNECTED",
    endpoint: db.endpoint || "agent://stellar-runtime",
    runtime: db.runtime || "ElizaOS Stellar Agent",
    model: db.model || "gemini-2.0-flash",
    totalVerifications: db.total_verifications || 0,
    passRate: Number(db.pass_rate) || 100,
    lastActive: "Just now",
    verifiedTxCount: 0,
    apiKeySnippet: `vera_live_${db.id.slice(0, 8)}`,
    attestationSchema: "Stellar Horizon Testnet Receipt",
    capabilities: Array.isArray(db.capabilities) ? db.capabilities : ["task_execution", "stellar_payment"],
    permissions: Array.isArray(db.permissions) ? db.permissions : ["read_tasks", "stellar_attestation"],
    guardrailMode: db.guardrail_mode || "standard",
    consentGiven: true,
    connectedAt: db.created_at,
    stellarAccount: db.stellar_account || "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L",
  };
}

export const supabaseAgentsService = {
  /**
   * Fetch all agents owned by the authenticated user
   */
  async listAgents(userId: string): Promise<Agent[]> {
    if (!isSupabaseConfigured || !userId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[supabaseAgentsService] Error fetching agents:", error);
        return [];
      }

      return (data || []).map(mapDbAgentToAgent);
    } catch (err) {
      console.error("[supabaseAgentsService] listAgents failed:", err);
      return [];
    }
  },

  /**
   * Connect and persist a new agent for the authenticated user
   */
  async connectAgent(
    userId: string,
    data: {
      id?: string;
      name: string;
      endpoint?: string;
      runtime?: string;
      model?: string;
      capabilities?: string[];
      permissions?: string[];
      guardrailMode?: "standard" | "strict";
      stellarAccount?: string;
      connectionType?: "api" | "webhook" | "telegram";
      telegramIdentifier?: string;
    }
  ): Promise<Agent> {
    const agentId =
      data.id ||
      data.name.toLowerCase().replace(/[^a-z0-9]/g, "-") ||
      `agent-${Date.now().toString(36)}`;

    const dbPayload: Partial<DbAgent> = {
      id: agentId,
      user_id: userId,
      name: data.name,
      type: "autonomous_worker",
      connection_type: data.connectionType || (data.endpoint?.startsWith("@") ? "telegram" : "api"),
      connection_status: "CONNECTED",
      telegram_identifier: data.telegramIdentifier || (data.endpoint?.startsWith("@") ? data.endpoint : null),
      endpoint: data.endpoint || "agent://stellar-runtime",
      runtime: data.runtime || "ElizaOS Stellar Agent",
      model: data.model || "gemini-2.0-flash",
      capabilities: data.capabilities || ["task_execution", "stellar_payment"],
      permissions: data.permissions || ["read_tasks", "stellar_attestation"],
      guardrail_mode: data.guardrailMode || "standard",
      stellar_account: data.stellarAccount || "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L",
      total_verifications: 0,
      pass_rate: 100,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && userId) {
      try {
        const { data: inserted, error } = await supabase
          .from("agents")
          .upsert(dbPayload, { onConflict: "id" })
          .select()
          .single();

        if (error) {
          console.error("[supabaseAgentsService] Error saving agent to Supabase:", error);
        } else if (inserted) {
          return mapDbAgentToAgent(inserted as DbAgent);
        }
      } catch (err) {
        console.error("[supabaseAgentsService] connectAgent failed:", err);
      }
    }

    // Return in-memory formatted representation if offline
    return {
      id: agentId,
      name: data.name,
      version: "v1.0",
      status: "CONNECTED",
      endpoint: data.endpoint || "agent://stellar-runtime",
      runtime: data.runtime || "ElizaOS Stellar Agent",
      model: data.model || "gemini-2.0-flash",
      totalVerifications: 0,
      passRate: 100,
      lastActive: "Just now",
      verifiedTxCount: 0,
      apiKeySnippet: `vera_live_${agentId.slice(0, 8)}`,
      attestationSchema: "Stellar Horizon Testnet Receipt",
      capabilities: data.capabilities || ["task_execution", "stellar_payment"],
      permissions: data.permissions || ["read_tasks", "stellar_attestation"],
      guardrailMode: data.guardrailMode || "standard",
      consentGiven: true,
      connectedAt: new Date().toISOString(),
      stellarAccount: data.stellarAccount || "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L",
    };
  },

  /**
   * Disconnect an agent
   */
  async disconnectAgent(userId: string, agentId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return true;

    try {
      const { error } = await supabase
        .from("agents")
        .update({
          connection_status: "NOT_CONNECTED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", agentId)
        .eq("user_id", userId);

      return !error;
    } catch {
      return false;
    }
  },
};
