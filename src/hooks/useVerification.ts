import { useState, useEffect, useCallback } from "react";
import { VerificationRecord } from "../types/verification";
import { verificationApi } from "../services/verificationApi";

export function useVerification(id?: string) {
  const [data, setData] = useState<VerificationRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isResubmitting, setIsResubmitting] = useState<boolean>(false);

  const fetchRecord = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const record = await verificationApi.get(id);
      if (!record) {
        setError(`Verification ${id} could not be found.`);
      } else {
        setData(record);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load verification");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const resubmit = useCallback(
    async (patch?: { target?: string; supplementalAmount?: number; txHash?: string }) => {
      if (!id) return null;
      setIsResubmitting(true);
      setError(null);
      try {
        const updated = await verificationApi.resubmit(id, patch);
        setData(updated);
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to resubmit verification");
        return null;
      } finally {
        setIsResubmitting(false);
      }
    },
    [id]
  );

  return {
    verification: data,
    loading,
    error,
    isResubmitting,
    refetch: fetchRecord,
    resubmit,
  };
}

export function useVerificationsList(statusFilter?: string, searchQuery?: string) {
  const [list, setList] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await verificationApi.list({
        status: statusFilter,
        search: searchQuery,
      });
      setList(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load verifications");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return {
    verifications: list,
    loading,
    error,
    refetch: fetchList,
  };
}
