import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * A custom hook to manage state history, supporting Undo and Redo operations.
 * It uses a debounce mechanism to group quick successive changes (like keystrokes)
 * into a single history snapshot.
 * 
 * @param initialValue The initial state value.
 * @param maxDepth The maximum number of history snapshots to keep (default 50).
 * @param debounceMs The debounce delay in milliseconds (default 500).
 */
export function useHistory<T>(initialValue: T, maxDepth = 50, debounceMs = 500) {
  const [present, setPresent] = useState<T>(initialValue);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  // Ref to hold the latest present value so that our debounced timer and callbacks always have the freshest value.
  const presentRef = useRef<T>(present);
  useEffect(() => {
    presentRef.current = present;
  }, [present]);

  // Ref to hold the last committed value to prevent duplicate snapshots or recording unchanged state.
  const lastCommittedRef = useRef<T>(initialValue);

  // Debounced effect to push present value into history after user stops typing/editing.
  useEffect(() => {
    // If the present value is identical to the last committed value, skip creating a history snapshot.
    if (JSON.stringify(present) === JSON.stringify(lastCommittedRef.current)) {
      return;
    }

    const timer = setTimeout(() => {
      const valToCommit = presentRef.current;
      setPast((prevPast) => {
        const newPast = [...prevPast, lastCommittedRef.current];
        if (newPast.length > maxDepth) {
          return newPast.slice(newPast.length - maxDepth);
        }
        return newPast;
      });
      lastCommittedRef.current = valToCommit;
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [present, maxDepth, debounceMs]);

  // Function to set the value. Optionally commits to history immediately.
  const updateValue = useCallback((newValue: T | ((prev: T) => T), commitImmediately = false) => {
    setPresent((prev) => {
      const resolved = typeof newValue === 'function' ? (newValue as Function)(prev) : newValue;
      
      if (commitImmediately) {
        if (JSON.stringify(resolved) !== JSON.stringify(lastCommittedRef.current)) {
          setPast((prevPast) => {
            const newPast = [...prevPast, lastCommittedRef.current];
            if (newPast.length > maxDepth) {
              return newPast.slice(newPast.length - maxDepth);
            }
            return newPast;
          });
          lastCommittedRef.current = resolved;
        }
      }
      return resolved;
    });

    const resolvedValue = typeof newValue === 'function' 
      ? (newValue as Function)(presentRef.current) 
      : newValue;

    if (JSON.stringify(resolvedValue) !== JSON.stringify(presentRef.current)) {
      setFuture((prevFuture) => (prevFuture.length > 0 ? [] : prevFuture));
    }
  }, [maxDepth]);

  // Reverts the last state snapshot or uncommitted changes.
  const undo = useCallback(() => {
    const hasUncommitted = JSON.stringify(presentRef.current) !== JSON.stringify(lastCommittedRef.current);
    
    if (hasUncommitted) {
      const currentPresent = presentRef.current;
      setFuture((prevFuture) => [currentPresent, ...prevFuture]);
      setPresent(lastCommittedRef.current);
    } else {
      setPast((prevPast) => {
        if (prevPast.length === 0) return prevPast;
        
        const previous = prevPast[prevPast.length - 1];
        const newPast = prevPast.slice(0, -1);
        
        setFuture((prevFuture) => [presentRef.current, ...prevFuture]);
        setPresent(previous);
        lastCommittedRef.current = previous;
        
        return newPast;
      });
    }
  }, []);

  // Re-applies an undone state snapshot.
  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);
      
      setPast((prevPast) => [...prevPast, presentRef.current]);
      setPresent(next);
      lastCommittedRef.current = next;
      
      return newFuture;
    });
  }, []);

  // Resets state and clears all history stacks.
  const reset = useCallback((newValue: T) => {
    setPresent(newValue);
    setPast([]);
    setFuture([]);
    lastCommittedRef.current = newValue;
  }, []);

  const hasUncommitted = JSON.stringify(present) !== JSON.stringify(lastCommittedRef.current);

  return {
    value: present,
    setValue: updateValue,
    undo,
    redo,
    canUndo: past.length > 0 || hasUncommitted,
    canRedo: future.length > 0,
    reset,
  };
}
