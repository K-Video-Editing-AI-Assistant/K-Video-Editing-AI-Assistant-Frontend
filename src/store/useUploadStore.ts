import { create } from 'zustand';

type UploadState = {
  file: File | null; // The video the user picked
  setFile: (file: File | null) => void; // Replaces (or clears) the picked video
};

// A shared box any page can read from and write to
export const useUploadStore = create<UploadState>((set) => ({
  file: null,
  setFile: (file) => set({ file }),
}));
