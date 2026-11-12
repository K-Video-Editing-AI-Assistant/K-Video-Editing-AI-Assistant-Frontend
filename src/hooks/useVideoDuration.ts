import { useEffect, useState } from 'react';

// Reads how long a video file is (in seconds). The file never leaves the browser.
// Returns null while it is still loading or when there is no file.
export function useVideoDuration(file: File | null): number | null {
  // Remember which file the number belongs to, so an old result is never shown for a new file
  const [result, setResult] = useState<{ file: File; seconds: number } | null>(null);

  // useEffect runs this code after the screen is drawn, and again whenever "file" changes
  useEffect(() => {
    if (!file) return;

    // A temporary address that lets a hidden <video> element read the local file
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata'; // Only load the info (like length), not the whole video
    video.onloadedmetadata = () => {
      setResult({ file, seconds: video.duration });
    };
    video.src = url;

    // Cleanup: runs before the next effect or when the page closes
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return result && result.file === file ? result.seconds : null;
}
