import { useState } from 'react';
import api, { errorMessage } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { useFetch } from './useFetch.js';

/** Paginated list + delete confirm ka common logic. */
export function useCrudList(endpoint, extraParams = {}) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data, loading, error, reload } = useFetch(endpoint, { page, ...extraParams });

  const confirmDelete = async (afterDelete) => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`${endpoint}/${toDelete.id}`);
      toast.success(res.data.message || 'Deleted successfully.');
      setToDelete(null);
      if (data?.data?.length === 1 && page > 1) setPage(page - 1); // last page ka akhri record
      else await reload();
      afterDelete?.();
    } catch (e) {
      toast.error(errorMessage(e));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return { rows: data?.data || [], meta: data?.meta, loading, error, page, setPage, reload, toDelete, setToDelete, deleting, confirmDelete };
}
