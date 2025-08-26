import { useState, useEffect, useCallback } from 'react';

type Capability = 'fast' | 'smart' | 'deep' | 'deep-thinking';

interface PanelState {
  leftOpen: boolean;
  rightOpen: boolean;
  wL: number;
  wR: number;
  mode: Capability;
}

const DEFAULT_STATE: PanelState = {
  leftOpen: true,
  rightOpen: true,
  wL: 280,
  wR: 320,
  mode: 'smart',
};

const STORAGE_KEY = 'liminal.ui.panels';

export const usePanelState = () => {
  const [state, setState] = useState<PanelState>(DEFAULT_STATE);

  // Load state from URL params and localStorage on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedState = stored ? JSON.parse(stored) : {};

    const newState: PanelState = {
      leftOpen:
        urlParams.get('left') === 'off' ? false : (storedState.leftOpen ?? DEFAULT_STATE.leftOpen),
      rightOpen:
        urlParams.get('right') === 'off'
          ? false
          : (storedState.rightOpen ?? DEFAULT_STATE.rightOpen),
      wL: Number.parseInt(urlParams.get('wL') || '') || storedState.wL || DEFAULT_STATE.wL,
      wR: Number.parseInt(urlParams.get('wR') || '') || storedState.wR || DEFAULT_STATE.wR,
      mode: (urlParams.get('mode') as Capability) || storedState.mode || DEFAULT_STATE.mode,
    };

    setState(newState);
  }, []);

  // Persist state to URL and localStorage
  const persistState = useCallback((newState: PanelState) => {
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('left', newState.leftOpen ? 'on' : 'off');
    url.searchParams.set('right', newState.rightOpen ? 'on' : 'off');
    url.searchParams.set('wL', newState.wL.toString());
    url.searchParams.set('wR', newState.wR.toString());
    url.searchParams.set('mode', newState.mode);

    window.history.replaceState({}, '', url.toString());

    // Update localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const updateState = useCallback(
    (updates: Partial<PanelState>) => {
      setState((prev) => {
        const newState = { ...prev, ...updates };
        persistState(newState);
        return newState;
      });
    },
    [persistState],
  );

  const onToggleLeft = useCallback(() => {
    updateState({ leftOpen: !state.leftOpen });
  }, [state.leftOpen, updateState]);

  const onToggleRight = useCallback(() => {
    updateState({ rightOpen: !state.rightOpen });
  }, [state.rightOpen, updateState]);

  const onResizeLeft = useCallback(
    (wL: number) => {
      updateState({ wL });
    },
    [updateState],
  );

  const onResizeRight = useCallback(
    (wR: number) => {
      updateState({ wR });
    },
    [updateState],
  );

  const onSelectMode = useCallback(
    (mode: Capability) => {
      updateState({ mode });
    },
    [updateState],
  );

  return {
    state,
    onToggleLeft,
    onToggleRight,
    onResizeLeft,
    onResizeRight,
    onSelectMode,
  };
};
