import { useEffect, useMemo, useState } from 'react';
import type { DataNode, DataSourceProvider } from '../../dataSources/types';
import { dataSources } from '../../dataSources/registry';
import type { FieldKey, Graph, NodeId, PrefillMapping } from '../../domain/types';
import { filterTree } from './filterTree';
import { DataSourceTree } from './DataSourceTree';
import styles from './DataPickerModal.module.css';

interface Selection {
  providerId: string;
  leaf: DataNode;
}

interface Props {
  graph: Graph;
  currentNodeId: NodeId;
  currentField: { key: FieldKey; title: string };
  onCancel: () => void;
  onSelect: (mapping: PrefillMapping) => void;
}

export function DataPickerModal({
  graph,
  currentNodeId,
  currentField,
  onCancel,
  onSelect,
}: Props) {
  const [search, setSearch] = useState('');
  const [selection, setSelection] = useState<Selection | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const providerTrees = useMemo(() => {
    const ctx = { graph, currentFormId: currentNodeId };
    return dataSources.map((provider) => ({
      provider,
      nodes: filterTree(provider.getNodes(ctx), search),
    }));
  }, [graph, currentNodeId, search]);

  const isSearching = search.trim() !== '';
  const canSelect = selection !== null && selection.leaf.leafValue !== undefined;

  const handleConfirm = () => {
    if (selection === null || selection.leaf.leafValue === undefined) return;
    const { formId, fieldId } = selection.leaf.leafValue;
    onSelect({
      kind: selection.providerId,
      data: { formId, fieldId },
    });
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-picker-title"
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="data-picker-title" className={styles.title}>
            Select data element to map
          </h2>
          <p className={styles.subtitle}>
            Mapping <strong>{currentField.title}</strong>
          </p>
        </header>

        <div className={styles.body}>
          <aside className={styles.left}>
            <input
              type="search"
              className={styles.search}
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <div className={styles.treeScroll}>
              {providerTrees.map(({ provider, nodes }) => (
                <ProviderSection
                  key={provider.id}
                  provider={provider}
                  nodes={nodes}
                  forceExpanded={isSearching}
                  selectedLeafId={
                    selection !== null && selection.providerId === provider.id
                      ? selection.leaf.id
                      : null
                  }
                  onSelectLeaf={(leaf) => setSelection({ providerId: provider.id, leaf })}
                />
              ))}
            </div>
          </aside>
          <section className={styles.right}>
            {selection !== null && selection.leaf.leafValue !== undefined ? (
              <SelectionDetails graph={graph} selection={selection} />
            ) : (
              <p className={styles.empty}>Choose a data element from the left.</p>
            )}
          </section>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.cancel} onClick={onCancel}>
            CANCEL
          </button>
          <button
            type="button"
            className={styles.select}
            disabled={!canSelect}
            onClick={handleConfirm}
          >
            SELECT
          </button>
        </footer>
      </div>
    </div>
  );
}

interface ProviderSectionProps {
  provider: DataSourceProvider;
  nodes: DataNode[];
  forceExpanded: boolean;
  selectedLeafId: string | null;
  onSelectLeaf: (node: DataNode) => void;
}

function ProviderSection({
  provider,
  nodes,
  forceExpanded,
  selectedLeafId,
  onSelectLeaf,
}: ProviderSectionProps) {
  const [openLocal, setOpenLocal] = useState(true);
  const open = forceExpanded || openLocal;

  return (
    <div className={styles.provider}>
      <button
        type="button"
        className={styles.providerHeader}
        aria-expanded={open}
        onClick={() => setOpenLocal((v) => !v)}
      >
        <span className={styles.caret}>{open ? '▾' : '▸'}</span>
        {provider.label}
      </button>
      {open &&
        (nodes.length === 0 ? (
          <p className={styles.providerEmpty}>No items.</p>
        ) : (
          <div className={styles.providerBody}>
            <DataSourceTree
              nodes={nodes}
              forceExpanded={forceExpanded}
              selectedLeafId={selectedLeafId}
              onSelectLeaf={onSelectLeaf}
            />
          </div>
        ))}
    </div>
  );
}

function SelectionDetails({ graph, selection }: { graph: Graph; selection: Selection }) {
  const leaf = selection.leaf;
  if (leaf.leafValue === undefined) return null;
  const { formId, fieldId } = leaf.leafValue;
  const node = graph.nodes.get(formId);
  return (
    <div className={styles.details}>
      <h3 className={styles.detailsTitle}>{leaf.label}</h3>
      <dl className={styles.dl}>
        <dt>Source</dt>
        <dd>{node?.name ?? formId}</dd>
        <dt>Field</dt>
        <dd>{fieldId}</dd>
      </dl>
    </div>
  );
}
