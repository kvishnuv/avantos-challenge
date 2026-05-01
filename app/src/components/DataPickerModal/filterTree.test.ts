import { describe, it, expect } from 'vitest';
import { filterTree } from './filterTree';
import type { DataNode } from '../../dataSources/types';

const TREE: DataNode[] = [
  {
    id: 'form-A',
    label: 'Form A',
    children: [
      { id: 'form-A/email', label: 'Email', leafValue: { formId: 'form-A', fieldId: 'email' } },
      { id: 'form-A/name', label: 'Name', leafValue: { formId: 'form-A', fieldId: 'name' } },
    ],
  },
  {
    id: 'form-B',
    label: 'Form B',
    children: [
      { id: 'form-B/notes', label: 'Notes', leafValue: { formId: 'form-B', fieldId: 'notes' } },
    ],
  },
];

describe('filterTree', () => {
  it('returns input unchanged when query is empty', () => {
    expect(filterTree(TREE, '')).toEqual(TREE);
    expect(filterTree(TREE, '   ')).toEqual(TREE);
  });

  it('keeps a leaf and prunes its siblings when only the leaf matches', () => {
    const result = filterTree(TREE, 'email');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('form-A');
    expect(result[0].children).toEqual([
      { id: 'form-A/email', label: 'Email', leafValue: { formId: 'form-A', fieldId: 'email' } },
    ]);
  });

  it('keeps the entire subtree when a parent label matches', () => {
    const result = filterTree(TREE, 'Form A');
    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(2);
  });

  it('removes branches with no matching descendants', () => {
    expect(filterTree(TREE, 'no-match-xyz')).toEqual([]);
  });

  it('is case-insensitive', () => {
    const result = filterTree(TREE, 'EMAIL');
    expect(result[0].children).toHaveLength(1);
  });
});
