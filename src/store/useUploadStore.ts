import { create } from 'zustand';
import type { VideoUploadAccepted } from '@/api/videos';

type UploadState = {
  file: File | null;
  videoId: string | null;
  jobId: string | null;
  prepared: boolean;
  setFile: (file: File | null) => void;
  setUploaded: (result: VideoUploadAccepted) => void;
  setPrepared: (prepared: boolean) => void;
};

export const useUploadStore = create<UploadState>((set) => ({
  file: null,
  videoId: null,
  jobId: null,
  prepared: false,
  setFile: (file) => set({ file, videoId: null, jobId: null, prepared: false }),
  setUploaded: ({ videoId, jobId }) => set({ videoId, jobId, prepared: false }),
  setPrepared: (prepared) => set({ prepared }),
}));
