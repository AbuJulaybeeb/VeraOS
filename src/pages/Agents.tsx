import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAgents } from "../hooks/useAgents";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export const Agents: React.FC = () => {
  const navigate = useNavigate();
  const { agents, loading } = useAgents();

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-space-lg">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
              Autonomous Agent Registry
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-surface-container font-code-sm text-code-sm text-secondary border border-white/5">
              {agents.length} Registered
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Agents hooked into the VeraOS verification kernel for runtime attestation and autonomous remediation.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/agents/connect")}
          icon={
            <span className="material-symbols-outlined text-[18px]">
              hub
            </span>
          }
        >
          Connect Agent
        </Button>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
          <span className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
          <span className="font-code-sm text-code-sm">Loading registered agents...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="p-space-md rounded-2xl bg-surface-container-low border border-white/10 shadow-lg flex flex-col justify-between hover:border-white/20 transition-all group"
            >
              <div>
                {/* Top Row: Avatar, Name, Status Badge */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-md">
                      <span className="material-symbols-outlined text-[22px]">
                        smart_toy
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                          {agent.name}
                        </h3>
                        <span className="font-code-sm text-code-sm text-outline">
                          {agent.version}
                        </span>
                      </div>
                      <span className="font-code-sm text-[11px] text-on-surface-variant">
                        {agent.runtime}
                      </span>
                    </div>
                  </div>

                  {agent.status === "CONNECTED" && (
                    <Badge variant="passed" dot>
                      CONNECTED
                    </Badge>
                  )}
                  {agent.status === "IDLE" && (
                    <Badge variant="running" dot>
                      IDLE
                    </Badge>
                  )}
                  {agent.status === "NOT_CONNECTED" && (
                    <Badge variant="neutral">NOT CONNECTED</Badge>
                  )}
                </div>

                {/* Agent Details Table */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-container-lowest/80 p-3 rounded-xl border border-white/5 font-code-sm text-code-sm mb-4">
                  <div className="flex flex-col">
                    <span className="text-outline text-[10px] uppercase">
                      Model
                    </span>
                    <span className="text-on-surface font-semibold truncate">
                      {agent.model}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-outline text-[10px] uppercase">
                      Verifications
                    </span>
                    <span className="text-on-surface font-semibold">
                      {agent.totalVerifications}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-outline text-[10px] uppercase">
                      Pass Rate
                    </span>
                    <span className="text-[#4ade80] font-semibold">
                      {agent.passRate}%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-outline text-[10px] uppercase">
                      Active
                    </span>
                    <span className="text-secondary font-semibold">
                      {agent.lastActive}
                    </span>
                  </div>
                </div>

                {/* Capabilities Badges */}
                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  <span className="font-label-caps text-label-caps text-outline uppercase mr-1">
                    Scopes:
                  </span>
                  {agent.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-0.5 rounded bg-surface-container text-outline font-code-sm text-[10px] border border-white/5"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: API Snippet & Trigger */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-code-sm">
                <div className="flex items-center gap-1.5 text-outline">
                  <span className="material-symbols-outlined text-[14px]">
                    key
                  </span>
                  <span className="font-mono text-[11px]">
                    {agent.apiKeySnippet}
                  </span>
                </div>

                <Link
                  to="/verify/new"
                  className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-medium transition-colors"
                >
                  <span>Verify Task</span>
                  <span className="material-symbols-outlined text-[14px]">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
