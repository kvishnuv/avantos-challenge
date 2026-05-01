import { useState } from 'react';
import type { Field, FormNode, Graph, PrefillMapping } from '../../domain/types';
import { FieldRow } from './FieldRow';
import { DataPickerModal } from '../DataPickerModal/DataPickerModal';
import { usePrefill } from '../../state/PrefillContext';
import styles from './PrefillEditor.module.css';

interface Props {
  node: FormNode;
  graph: Graph;
}

export function PrefillEditor({ node, graph }: Props) {
  const template = graph.templates.get(node.templateId);
  const { setMapping } = usePrefill();
  const [picking, setPicking] = useState<Field | null>(null);

  if (!template) {
    return <p role="alert">Form template not found for {node.name}.</p>;
  }

  const handleSave = (mapping: PrefillMapping) => {
    if (picking === null) return;
    setMapping(node.id, picking.key, mapping);
    setPicking(null);
  };

  return (
    <>
      <div className={styles.list}>
        {template.fields.map((field) => (
          <FieldRow
            key={field.key}
            nodeId={node.id}
            field={field}
            graph={graph}
            onPick={() => setPicking(field)}
          />
        ))}
      </div>
      {picking !== null && (
        <DataPickerModal
          graph={graph}
          currentNodeId={node.id}
          currentField={{ key: picking.key, title: picking.title }}
          onCancel={() => setPicking(null)}
          onSelect={handleSave}
        />
      )}
    </>
  );
}
