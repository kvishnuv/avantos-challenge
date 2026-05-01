import { useGraphState } from '../../state/GraphContext';
import { setSelectedNodeId, useSelectedNodeId } from '../../state/urlState';
import styles from './FormList.module.css';

export function FormList() {
  const state = useGraphState();
  const selectedNodeId = useSelectedNodeId();

  if (state.status === 'loading') {
    return <p className={styles.message}>Loading…</p>;
  }
  if (state.status === 'error') {
    return (
      <p className={styles.message} role="alert">
        Failed to load: {state.error.message}
      </p>
    );
  }

  const nodes = [...state.graph.nodes.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <ul className={styles.list}>
      {nodes.map((node) => {
        const isSelected = node.id === selectedNodeId;
        const className = isSelected
          ? `${styles.button} ${styles.selected}`
          : styles.button;
        return (
          <li key={node.id} className={styles.item}>
            <button
              type="button"
              className={className}
              aria-current={isSelected ? 'page' : undefined}
              onClick={() => setSelectedNodeId(node.id)}
            >
              {node.name}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
