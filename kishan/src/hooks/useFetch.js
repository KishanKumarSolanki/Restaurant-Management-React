import { useCallback, useEffect, useRef, useState } from 'react';
import api, { errorMessage } from '../api/client.js';

/** GET request -> { data, loading, error, reload }. url/params badle to dobara fetch. */
export function useFetch(url, params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const paramsKey = JSON.stringify(params || {});
  const seq = useRef(0);

  const load = useCallback(async () => {
    if (!url) return;
    const my = ++seq.current;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(url, { params: JSON.parse(paramsKey) });
      if (my === seq.current) setData(res.data);
    } catch (e) {
      if (my === seq.current) setError(errorMessage(e));
    } finally {
      if (my === seq.current) setLoading(false);
    }
  }, [url, paramsKey]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}
