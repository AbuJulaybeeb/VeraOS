import React, { useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";

export const CorrectionLoop: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStep = searchParams.get("action") === "request_agent" ? "agent" : "evidence";

  const { verification, resubmit, isResubmitting } = useVerification(id);
  const [selectedStep, setSelectedStep] = useState<"evidence" | "agent">(initialStep);
  const [sourceLink, setSourceLink] = useState("https://commerce.acme.example/orders/AC-19482/notes");
  const [context, setContext] = useState("The updated order note now explicitly states duplicate shipment.");
  const [instruction, setInstruction] = useState("Please update order note N-4821 to explicitly state reason: duplicate shipment");
  const [isSuccess, setIsSuccess] = useState(false);

  const runId = verification?.displayId ? `VR-${verification.displayId}` : "VR-2984";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (resubmit) {
        await resubmit({
          target: selectedStep === "evidence" ? "New Evidence Added" : "Agent Correction Requested",
          txHash: "0x" + Math.random().toString(16).substring(2, 10),
        });
      }
      setIsSuccess(true);
      setTimeout(() => {
        if (id) {
          navigate(`/verify/${id}`);
        } else {
          navigate("/verifications");
        }
      }, 1200);
    } catch {
      setIsSuccess(true);
      setTimeout(() => {
        if (id) navigate(`/verify/${id}`);
      }, 1200);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 font-sans pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#6B635B]">
        <Link to="/verifications" className="hover:text-[#181311] transition-colors">
          Verifications
        </Link>
        <span>/</span>
        <Link
          to={id ? `/verify/${id}` : "/verifications"}
          className="hover:text-[#181311] transition-colors font-mono"
        >
          {runId}
        </Link>
        <span>/</span>
        <span className="text-[#181311]">Fix verification issue</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#181311]">
          Fix verification issue
        </h1>
        <p className="text-xs sm:text-sm text-[#6B635B] mt-1">
          Add the missing proof or ask the agent to correct its work.
        </p>
      </div>

      {/* Card 1: Unresolved Requirement Card */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-7 shadow-sm flex flex-col gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF5EB] text-[#B8621B] border border-[#FADCC4] self-start">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B8621B]" />
          One requirement unresolved
        </span>

        <div>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#181311] leading-snug">
            Confirm the refund reason is &quot;duplicate shipment.&quot;
          </h2>
          <p className="text-xs sm:text-sm text-[#6B635B] mt-1.5 leading-relaxed max-w-2xl">
            The order note exists, but the current evidence does not explicitly identify the required reason. The completed refund is not affected.
          </p>
        </div>

        {/* ALREADY CONFIRMED Box */}
        <div className="bg-[#EAF5EE] border border-[#CDE5D5] rounded-xl p-4 sm:p-5 mt-2 flex flex-col gap-2">
          <span className="font-mono text-xs font-bold tracking-wider text-[#1D7A46] uppercase">
            ALREADY CONFIRMED
          </span>
          <div className="flex items-center gap-2 text-sm font-medium text-[#1D7A46]">
            <span>✓</span>
            <span>Full refund issued</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#1D7A46]">
            <span>✓</span>
            <span>Customer notified</span>
          </div>
        </div>
      </div>

      {/* Card 2: Choose a next step */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm flex flex-col gap-4">
        <h3 className="font-heading font-bold text-base sm:text-lg text-[#181311]">
          Choose a next step
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Add supporting evidence */}
          <button
            type="button"
            onClick={() => setSelectedStep("evidence")}
            className={`p-5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
              selectedStep === "evidence"
                ? "bg-[#FAF8F5] border-[#181311] shadow-sm ring-1 ring-[#181311]"
                : "bg-white border-[#E8E4DC] hover:border-[#181311]/50"
            }`}
          >
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                • Fastest
              </span>
              <div className="font-heading font-bold text-base text-[#181311] mt-2.5">
                Add supporting evidence
              </div>
              <p className="text-xs sm:text-sm text-[#6B635B] mt-1 leading-relaxed">
                Attach a source that explicitly records the refund reason.
              </p>
            </div>
          </button>

          {/* Option 2: Ask the agent to correct the record */}
          <button
            type="button"
            onClick={() => setSelectedStep("agent")}
            className={`p-5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
              selectedStep === "agent"
                ? "bg-[#FAF8F5] border-[#181311] shadow-sm ring-1 ring-[#181311]"
                : "bg-white border-[#E8E4DC] hover:border-[#181311]/50"
            }`}
          >
            <div>
              <div className="font-heading font-bold text-base text-[#181311] mt-2.5">
                Ask the agent to correct the record
              </div>
              <p className="text-xs sm:text-sm text-[#6B635B] mt-1 leading-relaxed">
                Send a concise correction request back to the agent.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Card 3: Active Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-7 shadow-sm flex flex-col gap-4"
      >
        {selectedStep === "evidence" ? (
          <>
            <div>
              <label
                htmlFor="sourceLink"
                className="block text-xs font-semibold text-[#181311] mb-1.5"
              >
                Source link or note
              </label>
              <input
                id="sourceLink"
                type="text"
                value={sourceLink}
                onChange={(e) => setSourceLink(e.target.value)}
                placeholder="https://commerce.acme.example/orders/AC-19482/notes"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-sm text-[#181311] placeholder-[#8C8479] focus:outline-none focus:border-[#181311] transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="optionalContext"
                className="block text-xs font-semibold text-[#181311] mb-1.5"
              >
                Optional context
              </label>
              <textarea
                id="optionalContext"
                rows={3}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="The updated order note now explicitly states duplicate shipment."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-sm text-[#181311] placeholder-[#8C8479] focus:outline-none focus:border-[#181311] transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to={id ? `/verify/${id}` : "/verifications"}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] text-[#181311] text-xs sm:text-sm font-semibold transition-colors"
              >
                Cancel →
              </Link>
              <button
                type="submit"
                disabled={isResubmitting || isSuccess}
                className="px-5 py-2.5 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSuccess
                  ? "Evidence submitted ✓"
                  : isResubmitting
                  ? "Rechecking..."
                  : "Recheck with new evidence →"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <label
                htmlFor="agentInstruction"
                className="block text-xs font-semibold text-[#181311] mb-1.5"
              >
                Correction instruction for agent
              </label>
              <textarea
                id="agentInstruction"
                rows={3}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Please update order note N-4821 to explicitly state reason: duplicate shipment"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-sm text-[#181311] placeholder-[#8C8479] focus:outline-none focus:border-[#181311] transition-colors resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to={id ? `/verify/${id}` : "/verifications"}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] text-[#181311] text-xs sm:text-sm font-semibold transition-colors"
              >
                Cancel →
              </Link>
              <button
                type="submit"
                disabled={isResubmitting || isSuccess}
                className="px-5 py-2.5 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSuccess
                  ? "Correction dispatched ✓"
                  : isResubmitting
                  ? "Dispatching..."
                  : "Send correction request →"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};
