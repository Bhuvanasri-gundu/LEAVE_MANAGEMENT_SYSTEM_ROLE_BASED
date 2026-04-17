import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getLeaves as fetchLeavesApi,
  updateLeaveStatus as apiUpdateStatus,
  verifyDocument as apiVerifyDoc,
  cancelLeave as apiCancelLeave,
} from '../services/api';

const LeaveContext = createContext(null);

export function LeaveProvider({ children }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalise = (l) => ({
    ...l,
    id: l.id || l._id,
    managerComment: l.managerComment || '',
    document: l.document || null,
    documentStatus: l.documentStatus || 'None',
  });

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchLeavesApi();
      setLeaves((res.data?.data ?? res.data ?? []).map(normalise));
    } catch {
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if user is authenticated (token present)
    if (localStorage.getItem('token')) fetchLeaves();
    else setLoading(false);
  }, [fetchLeaves]);

  /** Prepend a freshly-created leave returned from the server */
  const addLeave = (leave) => {
    setLeaves((prev) => [normalise(leave), ...prev]);
  };

  /** Approve or Reject — calls PATCH /leaves/:id */
  const updateLeaveStatus = async (id, status, managerComment = '') => {
    await apiUpdateStatus(id, status, managerComment);
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status, managerComment: managerComment || l.managerComment } : l
      )
    );
  };

  /** Verify or Reject a document — calls PATCH /leaves/:id/document-verify */
  const updateDocumentStatus = async (id, documentStatus) => {
    await apiVerifyDoc(id, documentStatus);
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, documentStatus } : l))
    );
  };

  /** Cancel a pending leave — calls DELETE /leaves/:id */
  const cancelLeave = async (id) => {
    await apiCancelLeave(id);
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'Cancelled' } : l))
    );
  };

  return (
    <LeaveContext.Provider
      value={{ leaves, loading, fetchLeaves, addLeave, updateLeaveStatus, updateDocumentStatus, cancelLeave }}
    >
      {children}
    </LeaveContext.Provider>
  );
}

export function useLeaves() {
  const context = useContext(LeaveContext);
  if (!context) throw new Error('useLeaves must be used within a LeaveProvider');
  return context;
}

export default LeaveContext;
