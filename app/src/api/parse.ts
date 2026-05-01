import type { Field, FormNode, FormTemplate, Graph } from '../domain/types';
import { buildGraph } from '../domain/graph';

export interface RawBlueprint {
  id: string;
  name: string;
  nodes: RawNode[];
  forms: RawForm[];
}

export interface RawNode {
  id: string;
  type: string;
  data: {
    component_id: string;
    name: string;
    prerequisites: string[];
  };
}

export interface RawForm {
  id: string;
  name: string;
  field_schema: {
    type: string;
    properties: Record<string, RawProperty>;
    required?: string[];
  };
  ui_schema?: {
    elements?: Array<{ scope?: string }>;
  };
}

export interface RawProperty {
  type: string;
  avantos_type: string;
  title?: string;
  format?: string;
}

export function parseBlueprint(raw: RawBlueprint): Graph {
  const nodes: FormNode[] = raw.nodes.map((n) => ({
    id: n.id,
    name: n.data.name,
    templateId: n.data.component_id,
    prerequisiteIds: [...n.data.prerequisites],
  }));

  const templates: FormTemplate[] = raw.forms.map((f) => ({
    id: f.id,
    name: f.name,
    fields: extractFields(f),
  }));

  return buildGraph({ id: raw.id, name: raw.name, nodes, templates });
}

const SCOPE_PATTERN = /^#\/properties\/(.+)$/;

function extractFields(form: RawForm): Field[] {
  const properties = form.field_schema.properties;
  const required = new Set(form.field_schema.required ?? []);

  const uiOrder: string[] = [];
  for (const element of form.ui_schema?.elements ?? []) {
    const match = element.scope?.match(SCOPE_PATTERN);
    if (match && match[1] in properties) uiOrder.push(match[1]);
  }
  const seen = new Set(uiOrder);
  const trailing = Object.keys(properties).filter((k) => !seen.has(k));
  const ordered = [...uiOrder, ...trailing];

  return ordered.map((key) => {
    const prop = properties[key];
    return {
      key,
      title: prop.title ?? key,
      avantosType: prop.avantos_type,
      jsonType: prop.type,
      required: required.has(key),
    };
  });
}
