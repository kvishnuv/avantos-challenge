import { useGraphState } from '../../state/GraphContext';
import type { NodeId } from '../../domain/types';

export function FormList() {
  const state = useGraphState();

  if (state.status === 'loading') {
    return <p>Loading…</p>;
  }
  if (state.status === 'error') {
    return <p role="alert">Failed to load: {state.error.message}</p>;
  }

  const nodes = [...state.graph.nodes.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <section>
      <h1>{state.graph.name}</h1>
      <ul>
        {nodes.map((node) => (
          <li key={node.id}>
            <button type="button" onClick={() => selectNode(node.id)}>
              {node.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function selectNode(nodeId: NodeId): void {
  const params = new URLSearchParams(window.location.search);
  params.set('selectedNodeId', nodeId);
  const next = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState(null, '', next);
}
