import type { DataNode } from '../../dataSources/types';

export function filterTree(nodes: DataNode[], query: string): DataNode[] {
  const q = query.trim().toLowerCase();
  if (q === '') return nodes;
  const result: DataNode[] = [];
  for (const node of nodes) {
    const filtered = filterNode(node, q);
    if (filtered !== null) result.push(filtered);
  }
  return result;
}

function filterNode(node: DataNode, q: string): DataNode | null {
  const matchesSelf = node.label.toLowerCase().includes(q);
  if (node.children === undefined) {
    return matchesSelf ? node : null;
  }
  if (matchesSelf) return node;
  const filteredChildren: DataNode[] = [];
  for (const child of node.children) {
    const filtered = filterNode(child, q);
    if (filtered !== null) filteredChildren.push(filtered);
  }
  if (filteredChildren.length === 0) return null;
  return { ...node, children: filteredChildren };
}
