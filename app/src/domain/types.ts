export type NodeId = string;
export type FormTemplateId = string;
export type FieldKey = string;

export interface Field {
  key: FieldKey;
  title: string;
  avantosType: string;
  jsonType: string;
  required: boolean;
}

export interface FormTemplate {
  id: FormTemplateId;
  name: string;
  fields: Field[];
}

export interface FormNode {
  id: NodeId;
  name: string;
  templateId: FormTemplateId;
  prerequisiteIds: NodeId[];
}

export interface Graph {
  id: string;
  name: string;
  nodes: Map<NodeId, FormNode>;
  templates: Map<FormTemplateId, FormTemplate>;
  parents: Map<NodeId, Set<NodeId>>;
}

export type PrefillMapping =
  | { kind: 'upstream-field'; sourceNodeId: NodeId; sourceFieldKey: FieldKey }
  | { kind: 'global-property'; sourceId: string; path: string }
  | { kind: string; data: Record<string, unknown> };
