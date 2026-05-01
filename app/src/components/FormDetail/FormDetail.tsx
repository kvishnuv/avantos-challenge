import { useGraphState } from '../../state/GraphContext';
import { useSelectedNodeId } from '../../state/urlState';
import { PrefillEditor } from '../PrefillEditor/PrefillEditor';
import styles from './FormDetail.module.css';

export function FormDetail() {
  const state = useGraphState();
  const selectedNodeId = useSelectedNodeId();

  if (state.status !== 'ready') return null;

  if (selectedNodeId === null) {
    return <p className={styles.empty}>Select a form to configure prefill.</p>;
  }

  const node = state.graph.nodes.get(selectedNodeId);
  if (node === undefined) {
    return <p className={styles.empty}>Form not found: {selectedNodeId}</p>;
  }

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <h2 className={styles.title}>{node.name}</h2>
        <p className={styles.subtitle}>Prefill</p>
      </header>
      <PrefillEditor node={node} graph={state.graph} />
    </div>
  );
}
