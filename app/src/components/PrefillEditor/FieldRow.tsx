import type { Field, Graph, NodeId, PrefillMapping } from '../../domain/types';
import { DatabaseIcon } from '../icons/DatabaseIcon';
import { usePrefill } from '../../state/PrefillContext';
import styles from './FieldRow.module.css';

interface Props {
  nodeId: NodeId;
  field: Field;
  graph: Graph;
}

export function FieldRow({ nodeId, field, graph }: Props) {
  const { getMapping, clearMapping } = usePrefill();
  const mapping = getMapping(nodeId, field.key);

  if (mapping === undefined) {
    return (
      <div className={styles.unmapped}>
        <DatabaseIcon />
        <span className={styles.label}>{field.title}</span>
      </div>
    );
  }

  return (
    <div className={styles.mapped}>
      <DatabaseIcon />
      <span className={styles.label}>
        {field.title}: <span className={styles.value}>{describeMapping(mapping, graph)}</span>
      </span>
      <button
        type="button"
        className={styles.clear}
        aria-label={`Clear mapping for ${field.title}`}
        onClick={() => clearMapping(nodeId, field.key)}
      >
        ×
      </button>
    </div>
  );
}

function describeMapping(mapping: PrefillMapping, graph: Graph): string {
  if (mapping.kind === 'upstream-field' && 'sourceNodeId' in mapping) {
    const { sourceNodeId, sourceFieldKey } = mapping;
    const node = graph.nodes.get(sourceNodeId);
    const template = node ? graph.templates.get(node.templateId) : undefined;
    const sourceTitle = template?.fields.find((f) => f.key === sourceFieldKey)?.title;
    return `${node?.name ?? sourceNodeId}.${sourceTitle ?? sourceFieldKey}`;
  }
  if (mapping.kind === 'global-property' && 'sourceId' in mapping) {
    return `${mapping.sourceId}.${mapping.path}`;
  }
  return mapping.kind;
}
