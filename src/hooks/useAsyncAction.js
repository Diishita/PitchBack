import { useCallback, useState } from 'react';

export const useAsyncAction = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);
  const run = useCallback(async (action) => {
    setError('');
    setIsPending(true);
    try {
      return { data: await action(), error: null };
    } catch (actionError) {
      const message = actionError instanceof Error
        ? actionError.message
        : String(actionError);
      setError(message);
      return { data: null, error: message };
    } finally {
      setIsPending(false);
    }
  }, []);

  return { isPending, error, run, clearError };
};
