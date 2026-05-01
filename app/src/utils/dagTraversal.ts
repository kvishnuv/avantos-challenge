import type { Graph, NodeId } from '../domain/types';

export function getDirectUpstream(graph: Graph, formId: NodeId): NodeId[] {
  const parents = graph.parents.get(formId);
  return parents ? [...parents] : [];
}

export function getTransitiveUpstream(graph: Graph, formId: NodeId): NodeId[] {
  const direct = graph.parents.get(formId) ?? new Set<NodeId>();
  const visited = new Set<NodeId>([formId, ...direct]);
  const result: NodeId[] = [];
  const queue: NodeId[] = [...direct];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const ancestors = graph.parents.get(current);
    if (!ancestors) continue;
    for (const ancestor of ancestors) {
      if (visited.has(ancestor)) continue;
      visited.add(ancestor);
      result.push(ancestor);
      queue.push(ancestor);
    }
  }
  return result;
}
