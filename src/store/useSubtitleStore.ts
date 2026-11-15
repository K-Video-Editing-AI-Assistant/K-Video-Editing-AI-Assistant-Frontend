import { create } from 'zustand';
import type { Subtitle } from '@/types/subtitle';

type SubtitleState = {
  videoId: string | null;
  subtitles: Subtitle[];
  setSubtitles: (videoId: string, subtitles: Subtitle[]) => void;
};
export const useSubtitleStore = create<SubtitleState>((set) => ({
  videoId: null,
  subtitles: [],
  setSubtitles: (videoId, subtitles) => set({ videoId, subtitles }),
}));
