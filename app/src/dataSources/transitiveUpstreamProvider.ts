import type { NodeId } from '../domain/types';
import type { DataNode, DataSourceContext, DataSourceProvider } from './types';
import { getTransitiveUpstream } from '../utils/dagTraversal';

export const transitiveUpstreamProvider: DataSourceProvider = {
  id: 'transitive-upstream',
  label: 'Transitive upstream forms',
  getNodes(ctx: DataSourceContext): DataNode[] {
    return getTransitiveUpstream(ctx.graph, ctx.currentFormId).map((nodeId) =>
      buildFormNode(ctx, nodeId),
    );
  },
};

function buildFormNode(ctx: DataSourceContext, nodeId: NodeId): DataNode {
  const node = ctx.graph.nodes.get(nodeId);
  if (!node) {
    return { id: nodeId, label: nodeId, children: [] };
  }
  const template = ctx.graph.templates.get(node.templateId);
  const children: DataNode[] = (template?.fields ?? []).map((field) => ({
    id: `${nodeId}/${field.key}`,
    label: field.title,
    leafValue: { formId: nodeId, fieldId: field.key },
  }));
  return { id: nodeId, label: node.name, children };
}
