import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataPickerModal } from './DataPickerModal';
import { buildGraph } from '../../domain/graph';
import type { FormNode, FormTemplate, Graph } from '../../domain/types';

function makeGraph(): Graph {
  const template: FormTemplate = {
    id: 't',
    name: 'Template',
    fields: [
      { key: 'email', title: 'Email', avantosType: 'short-text', jsonType: 'string', required: true },
      { key: 'name', title: 'Name', avantosType: 'short-text', jsonType: 'string', required: true },
    ],
  };
  const formA: FormNode = { id: 'form-A', name: 'Form A', templateId: 't', prerequisiteIds: [] };
  const formB: FormNode = {
    id: 'form-B',
    name: 'Form B',
    templateId: 't',
    prerequisiteIds: ['form-A'],
  };
  return buildGraph({
    id: 'g',
    name: 'Test',
    nodes: [formA, formB],
    templates: [template],
  });
}

describe('DataPickerModal', () => {
  it('disables SELECT until a leaf is highlighted', () => {
    const graph = makeGraph();
    render(
      <DataPickerModal
        graph={graph}
        currentNodeId="form-B"
        currentField={{ key: 'email', title: 'Email' }}
        onCancel={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    const selectBtn = screen.getByRole('button', { name: /^SELECT$/ }) as HTMLButtonElement;
    expect(selectBtn.disabled).toBe(true);
  });

  it('saves a provider-agnostic mapping when a leaf is selected and SELECT is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const graph = makeGraph();

    render(
      <DataPickerModal
        graph={graph}
        currentNodeId="form-B"
        currentField={{ key: 'email', title: 'Email' }}
        onCancel={vi.fn()}
        onSelect={onSelect}
      />,
    );

    // Search auto-expands matching subtrees, sidestepping per-node accordions.
    await user.type(screen.getByPlaceholderText('Search'), 'email');
    await user.click(screen.getByRole('button', { name: 'Email' }));

    const selectBtn = screen.getByRole('button', { name: /^SELECT$/ }) as HTMLButtonElement;
    expect(selectBtn.disabled).toBe(false);

    await user.click(selectBtn);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith({
      kind: 'direct-upstream',
      data: { formId: 'form-A', fieldId: 'email' },
    });
  });

  it('CANCEL closes without saving', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onSelect = vi.fn();
    const graph = makeGraph();

    render(
      <DataPickerModal
        graph={graph}
        currentNodeId="form-B"
        currentField={{ key: 'email', title: 'Email' }}
        onCancel={onCancel}
        onSelect={onSelect}
      />,
    );

    await user.type(screen.getByPlaceholderText('Search'), 'email');
    await user.click(screen.getByRole('button', { name: 'Email' }));
    await user.click(screen.getByRole('button', { name: /^CANCEL$/ }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('search filters out non-matching providers', async () => {
    const user = userEvent.setup();
    const graph = makeGraph();

    render(
      <DataPickerModal
        graph={graph}
        currentNodeId="form-B"
        currentField={{ key: 'email', title: 'Email' }}
        onCancel={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    await user.type(screen.getByPlaceholderText('Search'), 'launchedBy');

    // 'launchedBy' lives only in the global-data provider's Action Properties.
    expect(screen.getByRole('button', { name: 'launchedBy' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Email' })).toBeNull();
  });
});
