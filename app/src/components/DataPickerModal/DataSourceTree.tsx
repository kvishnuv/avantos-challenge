import { useState } from 'react';
import type { DataNode } from '../../dataSources/types';
import styles from './DataSourceTree.module.css';

interface Props {
  nodes: DataNode[];
  forceExpanded: boolean;
  selectedLeafId: string | null;
  onSelectLeaf: (node: DataNode) => void;
}

export function DataSourceTree({ nodes, forceExpanded, selectedLeafId, onSelectLeaf }: Props) {
  return (
    <ul className={styles.tree}>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          forceExpanded={forceExpanded}
          selectedLeafId={selectedLeafId}
          onSelectLeaf={onSelectLeaf}
        />
      ))}
    </ul>
  );
}

interface NodeProps {
  node: DataNode;
  forceExpanded: boolean;
  selectedLeafId: string | null;
  onSelectLeaf: (node: DataNode) => void;
}

function TreeNode({ node, forceExpanded, selectedLeafId, onSelectLeaf }: NodeProps) {
  const [openLocal, setOpenLocal] = useState(false);
  const open = forceExpanded || openLocal;
  const isLeaf = node.leafValue !== undefined;
  const hasChildren = node.children !== undefined && node.children.length > 0;

  if (isLeaf) {
    const isSelected = selectedLeafId === node.id;
    const className = isSelected ? `${styles.leaf} ${styles.selected}` : styles.leaf;
    return (
      <li>
        <button type="button" className={className} onClick={() => onSelectLeaf(node)}>
          {node.label}
        </button>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        className={styles.group}
        aria-expanded={open}
        disabled={!hasChildren}
        onClick={() => setOpenLocal((v) => !v)}
      >
        <span className={styles.caret}>{open ? '▾' : '▸'}</span>
        {node.label}
      </button>
      {open && hasChildren && (
        <ul className={styles.children}>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              forceExpanded={forceExpanded}
              selectedLeafId={selectedLeafId}
              onSelectLeaf={onSelectLeaf}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
