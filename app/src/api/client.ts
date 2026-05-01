import type { RawBlueprint } from './parse';

const TENANT_ID = '123';
const BLUEPRINT_ID = 'bp_456';

export async function fetchBlueprint(signal?: AbortSignal): Promise<RawBlueprint> {
  const response = await fetch(
    `/api/v1/${TENANT_ID}/actions/blueprints/${BLUEPRINT_ID}/graph`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch blueprint: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as RawBlueprint;
}
