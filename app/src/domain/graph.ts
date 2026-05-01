import type { FormNode, FormTemplate, FormTemplateId, Graph, NodeId } from './types';

export interface BuildGraphInput {
  id: string;
  name: string;
  nodes: FormNode[];
  templates: FormTemplate[];
}

export function buildGraph(input: BuildGraphInput): Graph {
  const nodes = new Map<NodeId, FormNode>();
  for (const node of input.nodes) nodes.set(node.id, node);

  const templates = new Map<FormTemplateId, FormTemplate>();
  for (const template of input.templates) templates.set(template.id, template);

  const parents = new Map<NodeId, Set<NodeId>>();
  for (const node of input.nodes) {
    parents.set(node.id, new Set(node.prerequisiteIds));
  }

  return { id: input.id, name: input.name, nodes, templates, parents };
}

export function ancestorsOf(graph: Graph, nodeId: NodeId): Set<NodeId> {
  const result = new Set<NodeId>();
  const direct = graph.parents.get(nodeId);
  if (!direct) return result;

  const stack: NodeId[] = [...direct];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (result.has(current)) continue;
    result.add(current);
    const grandparents = graph.parents.get(current);
    if (grandparents) {
      for (const id of grandparents) stack.push(id);
    }
  }
  return result;
}
