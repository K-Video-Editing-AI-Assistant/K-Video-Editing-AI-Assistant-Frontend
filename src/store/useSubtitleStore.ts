import { create } from 'zustand';
import type { Subtitle } from '@/types/subtitle';

// Placeholder data. The real subtitles will come from the backend later.
const MOCK_SUBTITLES: Subtitle[] = [
  { id: '1', start: 0, text: '숲은 공기 중의 탄소를 흡수하고 저장하는 역할을 합니다.' },
  { id: '2', start: 12, text: '이번 영상에서는 탄소 흡수의 원리와 숲의 역할을 살펴봅니다.' },
  { id: '3', start: 130, text: '나무는 광합성 과정에서 이산화탄소를 흡수합니다.' },
  { id: '4', start: 144, text: '흡수한 탄소는 나무가 성장하는 데 사용됩니다.' },
  { id: '5', start: 342, text: '탄소는 나무의 줄기와 뿌리 등에 저장됩니다.' },
  { id: '6', start: 358, text: '숲의 토양에도 탄소가 저장될 수 있습니다.' },
  { id: '7', start: 545, text: '숲을 보전하는 일은 탄소 중립에 도움이 됩니다.' },
  { id: '8', start: 563, text: '나무를 심고 숲을 관리하는 활동이 중요합니다.' },
];

type SubtitleState = {
  subtitles: Subtitle[]; // All subtitle lines in time order
};

export const useSubtitleStore = create<SubtitleState>(() => ({
  subtitles: MOCK_SUBTITLES,
}));
