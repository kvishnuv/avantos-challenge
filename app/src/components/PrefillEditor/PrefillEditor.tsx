import type { FormNode, Graph } from '../../domain/types';
import { FieldRow } from './FieldRow';
import styles from './PrefillEditor.module.css';

interface Props {
  node: FormNode;
  graph: Graph;
}

export function PrefillEditor({ node, graph }: Props) {
  const template = graph.templates.get(node.templateId);
  if (!template) {
    return <p role="alert">Form template not found for {node.name}.</p>;
  }
  return (
    <div className={styles.list}>
      {template.fields.map((field) => (
        <FieldRow key={field.key} nodeId={node.id} field={field} graph={graph} />
      ))}
    </div>
  );
}
