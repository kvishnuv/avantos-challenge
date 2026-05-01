# Avantos Take-Home

Configure prefill mappings for forms in a workflow DAG. The app fetches a
graph of forms from a mock server, lets you click a form, and lets you map
each of its fields to a field on an upstream form (direct or transitive) or
to a global data source. New mapping sources are added without touching the
modal or any component code — see "Add a new data source" below.

## Run locally

```sh
# Terminal 1 — mock server on port 3000
cd server
node index.js

# Terminal 2 — app on port 5173
cd app
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api/*` to `localhost:3000`, so the
app calls the relative path `/api/v1/123/actions/blueprints/bp_456/graph`.

Requires Node 20+ (Vite 8 / Vitest 3).

## Add a new data source

A provider is one file in `app/src/dataSources/` plus one line in
`registry.ts`. The picker modal picks it up automatically.

```ts
// app/src/dataSources/tenantSettingsProvider.ts
import type { DataNode, DataSourceProvider } from './types';

const BUCKET_ID = 'tenant-settings';

const TREE: DataNode[] = [
  {
    id: BUCKET_ID,
    label: 'Tenant Settings',
    children: [
      makeLeaf('defaultLanguage'),
      makeLeaf('timezone'),
      makeLeaf('billingEmail'),
    ],
  },
];

function makeLeaf(fieldId: string): DataNode {
  return {
    id: `${BUCKET_ID}/${fieldId}`,
    label: fieldId,
    leafValue: { formId: BUCKET_ID, fieldId },
  };
}

export const tenantSettingsProvider: DataSourceProvider = {
  id: 'tenant-settings',
  label: 'Tenant Settings',
  getNodes: () => TREE,
};
```

Register it:

```ts
// app/src/dataSources/registry.ts
export const dataSources: DataSourceProvider[] = [
  directUpstreamProvider,
  transitiveUpstreamProvider,
  globalDataProvider,
  tenantSettingsProvider, // ← new
];
```

The selection saves as `{ kind: 'tenant-settings', data: { formId, fieldId } }`.
For dynamic providers, use the `context: { graph, currentFormId }` argument
to `getNodes` — see `directUpstreamProvider.ts` for the pattern.

## Architecture

Component tree:

```
App
└── GraphProvider                              loads /api graph
    └── PrefillProvider                        Map<NodeId, Map<FieldKey, PrefillMapping>>
        └── Shell
            ├── FormList                       left pane, ?selectedNodeId in URL
            └── FormDetail
                └── PrefillEditor              owns modal open-state
                    ├── FieldRow *             one per template field
                    └── DataPickerModal        opens on unmapped row click
                        └── DataSourceTree     recursive, registry-driven
```

The modal never imports a specific provider. It iterates the registry, calls
`getNodes(context)` on each, and saves `{ kind: provider.id, data: leafValue }`.

```
app/src/dataSources/
├── types.ts                       DataSourceProvider, DataNode, DataSourceContext
├── registry.ts                    ordered array of providers
├── directUpstreamProvider.ts      direct prerequisites of currentFormId
├── transitiveUpstreamProvider.ts  ancestors via BFS, direct ones excluded
└── globalDataProvider.ts          static buckets (Action / Client Org)
```

DAG traversal lives in `app/src/utils/dagTraversal.ts` — pure functions, no
React, used by both upstream providers.

## Tests

```sh
cd app
npm test            # one-shot
npm run test:watch  # watch mode
```

20 tests across 4 files:

- `utils/dagTraversal.test.ts` — direct/transitive upstream, including the
  diamond case (A→B, A→C, B→D, C→D returns A once, not twice).
- `api/parse.test.ts` — raw blueprint → Graph: parents adjacency, `ui_schema`
  field ordering, `required` / `title` fallbacks.
- `components/DataPickerModal/filterTree.test.ts` — search: empty query,
  parent-match keeps full subtree, leaf-match prunes siblings, case-insensitive.
- `components/DataPickerModal/DataPickerModal.test.tsx` — picker flow:
  SELECT disabled until a leaf is selected, the saved mapping shape is
  `{ kind: providerId, data: { formId, fieldId } }`, CANCEL doesn't save, and
  search filters leaves across all registered providers without the modal
  knowing provider types.
