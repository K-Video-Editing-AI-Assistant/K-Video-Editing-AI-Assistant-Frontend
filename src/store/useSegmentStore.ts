import { create } from 'zustand';
import type { Segment } from '@/types/segment';

// Placeholder data. The recommended segments will come from the backend later.
const MOCK_SEGMENTS: Segment[] = [
  { id: '1', title: '광합성으로 탄소를 흡수하는 원리', start: 130, end: 158 },
  { id: '2', title: '흡수한 탄소가 저장되는 과정', start: 342, end: 372 },
  { id: '3', title: '숲이 탄소 중립에 기여하는 이유', start: 545, end: 582 },
];

type SegmentState = {
  segments: Segment[]; // All recommended segments
  selectedIds: string[]; // Ids of the segments the user ticked
  toggleSelected: (id: string) => void; // Tick or untick one segment
  selectAll: () => void; // Tick every segment
  clearSelection: () => void; // Untick every segment
};

export const useSegmentStore = create<SegmentState>((set) => ({
  segments: MOCK_SEGMENTS,
  selectedIds: [],
  toggleSelected: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedIds, id],
    })),
  selectAll: () => set((state) => ({ selectedIds: state.segments.map((segment) => segment.id) })),
  clearSelection: () => set({ selectedIds: [] }),
}));
