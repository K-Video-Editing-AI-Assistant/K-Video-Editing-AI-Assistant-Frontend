import { useEffect, useRef } from 'react';
import clsx from 'clsx';

type VideoPreviewProps = {
  file: File; // The video to show
  startAt?: number; // Which second to show as the still image (default 0.1)
  className?: string; // Size and shape. Defaults to a 16:9 box with rounded corners.
};

function VideoPreview({ file, startAt = 0.1, className }: VideoPreviewProps) {
  // Points to the <video> element so we can give it the file below
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // A temporary address that lets the <video> element read the local file
    const url = URL.createObjectURL(file);
    // "#t=" asks the browser to show the frame at that second as a still image
    video.src = `${url}#t=${startAt}`;

    // Cleanup: free the temporary address when the file changes or the page closes
    return () => URL.revokeObjectURL(url);
  }, [file, startAt]);

  return (
    <video
      ref={videoRef}
      muted
      preload='metadata'
      className={clsx('bg-surface object-cover', className ?? 'aspect-video w-full rounded-2xl')}
    />
  );
}

export default VideoPreview;
