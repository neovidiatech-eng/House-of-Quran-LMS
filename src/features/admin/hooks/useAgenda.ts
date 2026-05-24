import { useEffect, useState } from "react";
import { AgendaSession } from "../../../types/Agenda";
import { AgendaService } from "../services/AgendaService";

export const useAgenda = (startDate: string, endDate: string) => {
  const [sessions, setSessions] = useState<AgendaSession[]>([]);
  const [plannedCount, setPlannedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgenda = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await AgendaService.getCalendarSessions(startDate, endDate);

      setSessions(data.sessions);
      setPlannedCount(data.planned);
    } catch (err: any) {
      setError(err?.message || "Failed to load agenda");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, [startDate, endDate]);

  return {
    sessions,
    plannedCount,
    loading,
    error,
    refetch: fetchAgenda,
  };
};
