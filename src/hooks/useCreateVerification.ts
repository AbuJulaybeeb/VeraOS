import { useState } from "react";
import { CreateVerificationInput, VerificationRecord } from "../types/verification";
import { verificationApi } from "../services/verificationApi";

export function useCreateVerification() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVerification = async (
    input: CreateVerificationInput
  ): Promise<VerificationRecord | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await verificationApi.create(input);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create verification");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createVerification,
    isSubmitting,
    error,
  };
}
