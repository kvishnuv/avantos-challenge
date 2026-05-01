import { describe, it, expect } from 'vitest';
import { parseBlueprint, type RawBlueprint } from './parse';

const RAW: RawBlueprint = {
  id: 'bp_1',
  name: 'Test',
  nodes: [
    {
      id: 'form-A',
      type: 'form',
      data: { component_id: 't1', name: 'Form A', prerequisites: [] },
    },
    {
      id: 'form-B',
      type: 'form',
      data: { component_id: 't1', name: 'Form B', prerequisites: ['form-A'] },
    },
  ],
  forms: [
    {
      id: 't1',
      name: 'Template',
      field_schema: {
        type: 'object',
        properties: {
          email: { type: 'string', avantos_type: 'short-text', title: 'Email' },
          name: { type: 'string', avantos_type: 'short-text' },
        },
        required: ['email'],
      },
      ui_schema: {
        elements: [{ scope: '#/properties/name' }, { scope: '#/properties/email' }],
      },
    },
  ],
};

describe('parseBlueprint', () => {
  it('keys nodes by their workflow id', () => {
    const graph = parseBlueprint(RAW);
    expect([...graph.nodes.keys()]).toEqual(['form-A', 'form-B']);
  });

  it('captures direct prerequisites in the parents adjacency', () => {
    const graph = parseBlueprint(RAW);
    expect([...(graph.parents.get('form-B') ?? [])]).toEqual(['form-A']);
    expect([...(graph.parents.get('form-A') ?? [])]).toEqual([]);
  });

  it('orders fields by ui_schema and falls back to schema key order', () => {
    const graph = parseBlueprint(RAW);
    const keys = graph.templates.get('t1')?.fields.map((f) => f.key);
    expect(keys).toEqual(['name', 'email']);
  });

  it('marks required fields and falls back title to key when missing', () => {
    const fields = parseBlueprint(RAW).templates.get('t1')!.fields;
    const email = fields.find((f) => f.key === 'email')!;
    const name = fields.find((f) => f.key === 'name')!;
    expect(email).toMatchObject({ required: true, title: 'Email' });
    expect(name).toMatchObject({ required: false, title: 'name' });
  });
});
