import type { DataSourceProvider } from './types';
import { directUpstreamProvider } from './directUpstreamProvider';
import { transitiveUpstreamProvider } from './transitiveUpstreamProvider';
import { globalDataProvider } from './globalDataProvider';

export const dataSources: DataSourceProvider[] = [
  directUpstreamProvider,
  transitiveUpstreamProvider,
  globalDataProvider,
];
