import type { DataNode, DataSourceProvider } from './types';

const ACTION_PROPERTIES_ID = 'action-properties';
const CLIENT_ORG_PROPERTIES_ID = 'client-organisation-properties';

const GLOBAL_TREE: DataNode[] = [
  {
    id: ACTION_PROPERTIES_ID,
    label: 'Action Properties',
    children: [
      makeLeaf(ACTION_PROPERTIES_ID, 'launchedBy'),
      makeLeaf(ACTION_PROPERTIES_ID, 'launchedAt'),
      makeLeaf(ACTION_PROPERTIES_ID, 'tenantId'),
    ],
  },
  {
    id: CLIENT_ORG_PROPERTIES_ID,
    label: 'Client Organisation Properties',
    children: [
      makeLeaf(CLIENT_ORG_PROPERTIES_ID, 'organizationId'),
      makeLeaf(CLIENT_ORG_PROPERTIES_ID, 'organizationName'),
      makeLeaf(CLIENT_ORG_PROPERTIES_ID, 'region'),
    ],
  },
];

function makeLeaf(bucketId: string, fieldId: string): DataNode {
  return {
    id: `${bucketId}/${fieldId}`,
    label: fieldId,
    leafValue: { formId: bucketId, fieldId },
  };
}

export const globalDataProvider: DataSourceProvider = {
  id: 'global-data',
  label: 'Global Data',
  getNodes(): DataNode[] {
    return GLOBAL_TREE;
  },
};
