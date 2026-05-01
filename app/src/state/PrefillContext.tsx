import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { FieldKey, NodeId, PrefillMapping } from '../domain/types';

type Store = Map<NodeId, Map<FieldKey, PrefillMapping>>;

interface PrefillApi {
  getMapping(nodeId: NodeId, fieldKey: FieldKey): PrefillMapping | undefined;
  setMapping(nodeId: NodeId, fieldKey: FieldKey, mapping: PrefillMapping): void;
  clearMapping(nodeId: NodeId, fieldKey: FieldKey): void;
}

const PrefillContext = createContext<PrefillApi | null>(null);

// TEMP: Phase 5 seed — remove when the mapping picker lands.
const SEED_FORM_D: NodeId = 'form-0f58384c-4966-4ce6-9ec2-40b96d61f745';
const SEED_FORM_A: NodeId = 'form-47c61d17-62b0-4c42-8ca2-0eff641c9d88';

function createSeedStore(): Store {
  const fields = new Map<FieldKey, PrefillMapping>();
  fields.set('email', {
    kind: 'upstream-field',
    sourceNodeId: SEED_FORM_A,
    sourceFieldKey: 'email',
  });
  return new Map([[SEED_FORM_D, fields]]);
}

export function PrefillProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => createSeedStore());

  const api = useMemo<PrefillApi>(
    () => ({
      getMapping(nodeId, fieldKey) {
        return store.get(nodeId)?.get(fieldKey);
      },
      setMapping(nodeId, fieldKey, mapping) {
        setStore((prev) => {
          const next = new Map(prev);
          const fields = new Map(next.get(nodeId) ?? []);
          fields.set(fieldKey, mapping);
          next.set(nodeId, fields);
          return next;
        });
      },
      clearMapping(nodeId, fieldKey) {
        setStore((prev) => {
          const fields = prev.get(nodeId);
          if (!fields || !fields.has(fieldKey)) return prev;
          const nextFields = new Map(fields);
          nextFields.delete(fieldKey);
          const next = new Map(prev);
          if (nextFields.size === 0) {
            next.delete(nodeId);
          } else {
            next.set(nodeId, nextFields);
          }
          return next;
        });
      },
    }),
    [store],
  );

  return <PrefillContext.Provider value={api}>{children}</PrefillContext.Provider>;
}

export function usePrefill(): PrefillApi {
  const ctx = useContext(PrefillContext);
  if (ctx === null) {
    throw new Error('usePrefill must be used inside <PrefillProvider>');
  }
  return ctx;
}
