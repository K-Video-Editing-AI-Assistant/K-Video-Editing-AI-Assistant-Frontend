import { create } from 'zustand';

type RenderState = {
  videoId: string | null;
  renderId: string | null;
  clipCount: number;
  setRendered: (videoId: string, renderId: string, clipCount: number) => void;
  reset: () => void;
};
export const useRenderStore = create<RenderState>((set) => ({
  videoId: null,
  renderId: null,
  clipCount: 0,
  setRendered: (videoId, renderId, clipCount) => set({ videoId, renderId, clipCount }),
  reset: () => set({ videoId: null, renderId: null, clipCount: 0 }),
}));
