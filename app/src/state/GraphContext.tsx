import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Graph } from '../domain/types';
import { fetchBlueprint } from '../api/client';
import { parseBlueprint } from '../api/parse';

export type GraphState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; graph: Graph };

const GraphStateContext = createContext<GraphState | null>(null);

export function GraphProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GraphState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    fetchBlueprint(controller.signal)
      .then((raw) => {
        if (controller.signal.aborted) return;
        setState({ status: 'ready', graph: parseBlueprint(raw) });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });
    return () => controller.abort();
  }, []);

  return <GraphStateContext.Provider value={state}>{children}</GraphStateContext.Provider>;
}

export function useGraphState(): GraphState {
  const ctx = useContext(GraphStateContext);
  if (ctx === null) {
    throw new Error('useGraphState must be used inside <GraphProvider>');
  }
  return ctx;
}
