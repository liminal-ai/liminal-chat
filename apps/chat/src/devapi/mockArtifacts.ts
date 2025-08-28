import type { Artifact } from '@/types/chat';

export const MOCK_ARTIFACTS: Artifact[] = [
  { id: 'a_doc_1', name: 'Design Spec.pdf', type: 'doc' },
  { id: 'a_code_1', name: 'api/client.ts', type: 'code' },
  { id: 'a_data_1', name: 'metrics.csv', type: 'data' },
];

export const MOCK_ARTIFACTS_MAP: Record<string, Artifact> = Object.fromEntries(
  MOCK_ARTIFACTS.map((a) => [a.id, a]),
);
