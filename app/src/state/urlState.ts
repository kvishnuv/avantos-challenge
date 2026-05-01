import { useEffect, useState } from 'react';
import type { NodeId } from '../domain/types';

const PARAM_KEY = 'selectedNodeId';
const URL_CHANGE_EVENT = 'avantos:urlchange';

export function getSelectedNodeId(): NodeId | null {
  return new URLSearchParams(window.location.search).get(PARAM_KEY);
}

export function setSelectedNodeId(nodeId: NodeId | null): void {
  const params = new URLSearchParams(window.location.search);
  if (nodeId === null) {
    params.delete(PARAM_KEY);
  } else {
    params.set(PARAM_KEY, nodeId);
  }
  const query = params.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ''}`;
  window.history.pushState(null, '', next);
  window.dispatchEvent(new Event(URL_CHANGE_EVENT));
}

export function useSelectedNodeId(): NodeId | null {
  const [value, setValue] = useState<NodeId | null>(() => getSelectedNodeId());
  useEffect(() => {
    const sync = () => setValue(getSelectedNodeId());
    window.addEventListener('popstate', sync);
    window.addEventListener(URL_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener(URL_CHANGE_EVENT, sync);
    };
  }, []);
  return value;
}
