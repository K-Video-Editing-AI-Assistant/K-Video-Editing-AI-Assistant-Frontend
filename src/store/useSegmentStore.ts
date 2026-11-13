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
  selectedIds: string[]; // Ids of the segments ticked on the selection page
  toggleSelected: (id: string) => void; // Tick or untick one segment
  selectAll: () => void; // Tick every segment
  clearSelection: () => void; // Untick every segment

  editIds: string[]; // Ids in the order they will be merged (edit page)
  startEdit: () => void; // Copy the ticked segments into the edit list
  moveInEdit: (id: string, direction: -1 | 1) => void; // -1 = earlier, 1 = later
  removeFromEdit: (id: string) => void; // Take one segment out of the edit list
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

  editIds: [],
  // Start from the ticked segments, in the order they appear in the video
  startEdit: () =>
    set((state) => ({
      editIds: state.segments
        .filter((segment) => state.selectedIds.includes(segment.id))
        .map((segment) => segment.id),
    })),
  moveInEdit: (id, direction) =>
    set((state) => {
      const index = state.editIds.indexOf(id);
      const target = index + direction;
      // Already at the edge: nothing to move
      if (index === -1 || target < 0 || target >= state.editIds.length) return state;

      // Swap the segment with its neighbor
      const next = [...state.editIds];
      [next[index], next[target]] = [next[target], next[index]];
      return { editIds: next };
    }),
  removeFromEdit: (id) =>
    set((state) => ({ editIds: state.editIds.filter((editId) => editId !== id) })),
}));
