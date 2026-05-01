import type { FieldKey, Graph, NodeId } from '../domain/types';

export interface DataNode {
  id: string;
  label: string;
  children?: DataNode[];
  leafValue?: { formId: NodeId; fieldId: FieldKey };
}

export interface DataSourceContext {
  graph: Graph;
  currentFormId: NodeId;
}

export interface DataSourceProvider {
  id: string;
  label: string;
  getNodes(context: DataSourceContext): DataNode[];
}
