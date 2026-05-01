import type { Field, Graph, NodeId, PrefillMapping } from '../../domain/types';
import { DatabaseIcon } from '../icons/DatabaseIcon';
import { usePrefill } from '../../state/PrefillContext';
import styles from './FieldRow.module.css';

interface Props {
  nodeId: NodeId;
  field: Field;
  graph: Graph;
  onPick: () => void;
}

export function FieldRow({ nodeId, field, graph, onPick }: Props) {
  const { getMapping, clearMapping } = usePrefill();
  const mapping = getMapping(nodeId, field.key);

  if (mapping === undefined) {
    return (
      <button type="button" className={styles.unmapped} onClick={onPick}>
        <DatabaseIcon />
        <span className={styles.label}>{field.title}</span>
      </button>
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
    return formatFormField(graph, mapping.sourceNodeId, mapping.sourceFieldKey);
  }
  if (mapping.kind === 'global-property' && 'sourceId' in mapping) {
    return `${mapping.sourceId}.${mapping.path}`;
  }
  if ('data' in mapping && isFormFieldData(mapping.data)) {
    return formatFormField(graph, mapping.data.formId, mapping.data.fieldId);
  }
  return mapping.kind;
}

function isFormFieldData(data: unknown): data is { formId: string; fieldId: string } {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return typeof obj.formId === 'string' && typeof obj.fieldId === 'string';
}

function formatFormField(graph: Graph, formId: string, fieldId: string): string {
  const node = graph.nodes.get(formId);
  if (node) {
    const template = graph.templates.get(node.templateId);
    const sourceField = template?.fields.find((f) => f.key === fieldId);
    return `${node.name}.${sourceField?.title ?? fieldId}`;
  }
  return `${formId}.${fieldId}`;
}
