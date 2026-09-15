import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export const EvidenceExplorer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { verification, loading, error } = useVerification(id);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant max-w-7xl mx-auto">
        <span className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
        <span className="font-code-sm text-code-sm">
          Loading evidence triangulation records...
        </span>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center flex flex-col items-center gap-4 bg-surface-container-low rounded-2xl border border-white/5">
        <h2 className="font-headline-md font-bold text-on-surface">
          Verification Not Found
        </h2>
        <Link to="/dashboard">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const currentAttempt =
    verification.attempts[verification.attempts.length - 1];
  const invariants = currentAttempt?.invariants || [];
  const evidenceList = currentAttempt?.evidence || [];
  const claims = currentAttempt?.workerClaims || [];


  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-space-lg">
      {/* Breadcrumb Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-outline">
            <Link to="/dashboard" className="hover:text-on-surface transition-colors">
              Verifications
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link
              to={`/verify/${verification.id}`}
              className="text-secondary font-medium hover:underline"
            >
              {verification.displayId}
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Evidence Explorer</span>
          </div>

          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
            Evidence Triangulation Explorer
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Inspect requirement-by-requirement assertions, worker claims, independent witnesses, and cryptographic proofs.
          </p>
        </div>

        <Link to={`/verify/${verification.id}`}>
          <Button
            variant="secondary"
            icon={
              <span className="material-symbols-outlined text-[16px]">
                arrow_back
              </span>
            }
          >
            Back to Verification
          </Button>
        </Link>
      </div>

      {/* Tripartite Principle Banner */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-primary-container/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-container text-[24px]">
            balance
          </span>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Tripartite Verification Principle
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Worker Claim (untrusted assertion) ≠ Independent Evidence (cryptographically witnessed) ≠ Verdict (consensus logic).
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-surface-container font-code-sm text-code-sm text-outline">
            Evidence: Stellar Horizon + Invariant Kernel
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        {["ALL", "ONCHAIN", "WEB_ORACLE", "TRACE_AUDIT"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3.5 py-1.5 rounded-lg font-label-caps text-label-caps uppercase transition-colors ${
              selectedType === type
                ? "bg-primary-container text-on-primary font-bold"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            {type.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Evidence Hierarchy Cards */}
      <div className="flex flex-col gap-space-md">
        {invariants.map((inv, index) => {
          const matchingClaim = claims.find(
            (c) => c.requirementId === inv.id
          );
          const matchingEvidence = evidenceList.filter(
            (e) =>
              e.requirementId === inv.id &&
              (selectedType === "ALL" || e.type === selectedType)
          );
          const isExpanded = expandedId === inv.id || expandedId === null;

          return (
            <div
              key={inv.id}
              className="rounded-xl bg-surface-container border border-white/10 shadow-lg overflow-hidden"
            >
              {/* Requirement Header */}
              <div
                onClick={() =>
                  setExpandedId(expandedId === inv.id ? null : inv.id)
                }
                className="p-5 bg-surface-container-high/70 hover:bg-surface-container-high transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-code-sm text-code-sm font-bold text-primary shrink-0">
                    0{index + 1}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-label-caps text-label-caps text-outline uppercase">
                        REQ-00{index + 1}
                      </span>
                      <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        {inv.name}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      {inv.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                  {inv.status === "PASSED" ? (
                    <Badge variant="passed">PASS</Badge>
                  ) : inv.status === "FAILED" ? (
                    <Badge variant="failed">FAILED</Badge>
                  ) : (
                    <Badge variant="unverified">UNVERIFIED</Badge>
                  )}
                  <span className="material-symbols-outlined text-outline">
                    {isExpanded ? "expand_less" : "expand_more"}
                  </span>
                </div>
              </div>

              {/* Requirement Body Breakdown */}
              {isExpanded && (
                <div className="p-5 flex flex-col gap-5 bg-surface-container/90">
                  {/* Step 1: Worker Claim */}
                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-outline text-[18px]">
                          smart_toy
                        </span>
                        <span className="font-label-caps text-label-caps uppercase text-outline font-bold">
                          Worker Claim (Untrusted Statement)
                        </span>
                      </div>
                      <span className="font-code-sm text-code-sm text-outline">
                        Source: Worker Output Trace
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface pl-2 border-l-2 border-outline/30 italic">
                      "{matchingClaim?.statement || "Claimed task completion satisfying requirement."}"
                    </p>
                  </div>

                  {/* Step 2: Independent Evidence */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-[18px]">
                          verified
                        </span>
                        <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                          Independent Grounding Evidence
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-label-caps text-label-caps">
                        Witnessed by VeraOS Kernel
                      </span>
                    </div>

                    {matchingEvidence.length > 0 ? (
                      matchingEvidence.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3.5 rounded-lg bg-surface-container-lowest border border-white/5 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                              {ev.title}
                            </span>
                            <span className="font-code-sm text-code-sm text-secondary">
                              {ev.proofType}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 font-code-sm text-code-sm pt-1">
                            {Object.entries(ev.data).map(([key, val]) => (
                              <div
                                key={key}
                                className="p-2 rounded bg-surface-container/60 flex flex-col"
                              >
                                <span className="text-outline text-[10px] uppercase">
                                  {key}
                                </span>
                                <span className="text-on-surface font-mono truncate">
                                  {String(val)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {ev.proofHash && (
                            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-code-sm">
                              <span className="text-outline">Proof Hash:</span>
                              <span className="font-mono text-primary truncate max-w-xs">
                                {ev.proofHash}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-3.5 rounded-lg bg-surface-container-lowest border border-white/5 text-code-sm text-outline">
                        No independent blockchain or web oracle evidence was found to corroborate this claim.
                      </div>
                    )}
                  </div>

                  {/* Step 3: Verdict Breakdown */}
                  <div className="p-4 rounded-xl bg-surface-container-high border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-label-caps text-label-caps uppercase text-outline">
                        DETERMINISTIC VERDICT
                      </span>
                      <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        Expected: {inv.expected} → Observed: {inv.actual || "Uncorroborated"}
                      </span>
                      {inv.delta && (
                        <span className="font-code-sm text-code-sm text-error font-medium">
                          Violation Delta: {inv.delta}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-code-sm text-code-sm text-outline">
                        Latency: {inv.latencyMs || 25}ms
                      </span>
                      {inv.status === "PASSED" ? (
                        <Badge variant="passed" dot>
                          GROUNDED PASS
                        </Badge>
                      ) : inv.status === "FAILED" ? (
                        <Badge variant="failed" dot>
                          INVARIANT REJECTED
                        </Badge>
                      ) : (
                        <Badge variant="unverified" dot>
                          UNVERIFIED
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
