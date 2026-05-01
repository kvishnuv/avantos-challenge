import { describe, it, expect } from 'vitest';
import { buildGraph } from '../domain/graph';
import type { FormNode, FormTemplate, Graph } from '../domain/types';
import { getDirectUpstream, getTransitiveUpstream } from './dagTraversal';

function makeGraph(nodes: Array<{ id: string; parents?: string[] }>): Graph {
  const formNodes: FormNode[] = nodes.map((n) => ({
    id: n.id,
    name: n.id,
    templateId: 't',
    prerequisiteIds: n.parents ?? [],
  }));
  const templates: FormTemplate[] = [{ id: 't', name: 't', fields: [] }];
  return buildGraph({ id: 'g', name: 'test', nodes: formNodes, templates });
}

describe('getDirectUpstream', () => {
  it('returns empty array for a node with no upstream', () => {
    const graph = makeGraph([{ id: 'A' }]);
    expect(getDirectUpstream(graph, 'A')).toEqual([]);
  });

  it('returns the single direct upstream', () => {
    const graph = makeGraph([
      { id: 'A' },
      { id: 'B', parents: ['A'] },
    ]);
    expect(getDirectUpstream(graph, 'B')).toEqual(['A']);
  });

  it('does not include transitive ancestors', () => {
    const graph = makeGraph([
      { id: 'A' },
      { id: 'B', parents: ['A'] },
      { id: 'C', parents: ['B'] },
    ]);
    expect(getDirectUpstream(graph, 'C')).toEqual(['B']);
  });
});

describe('getTransitiveUpstream', () => {
  it('returns empty array for a node with no upstream', () => {
    const graph = makeGraph([{ id: 'A' }]);
    expect(getTransitiveUpstream(graph, 'A')).toEqual([]);
  });

  it('returns empty array when only a direct upstream exists', () => {
    const graph = makeGraph([
      { id: 'A' },
      { id: 'B', parents: ['A'] },
    ]);
    expect(getTransitiveUpstream(graph, 'B')).toEqual([]);
  });

  it('returns multi-level ancestors and excludes direct ones', () => {
    const graph = makeGraph([
      { id: 'A' },
      { id: 'B', parents: ['A'] },
      { id: 'C', parents: ['B'] },
      { id: 'D', parents: ['C'] },
    ]);
    expect(getTransitiveUpstream(graph, 'D').sort()).toEqual(['A', 'B']);
  });

  it('handles diamond shape (A→B, A→C, B→D, C→D) without duplicates', () => {
    const graph = makeGraph([
      { id: 'A' },
      { id: 'B', parents: ['A'] },
      { id: 'C', parents: ['A'] },
      { id: 'D', parents: ['B', 'C'] },
    ]);
    expect(getTransitiveUpstream(graph, 'D')).toEqual(['A']);
  });
});
