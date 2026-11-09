import { useEffect, useRef } from 'react';

type VideoPreviewProps = {
  file: File; // The video to show
};

function VideoPreview({ file }: VideoPreviewProps) {
  // Points to the <video> element so we can give it the file below
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // A temporary address that lets the <video> element read the local file
    const url = URL.createObjectURL(file);
    // "#t=0.1" asks the browser to show the frame at 0.1 seconds as a still image
    video.src = `${url}#t=0.1`;

    // Cleanup: free the temporary address when the file changes or the page closes
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <video
      ref={videoRef}
      muted
      preload='metadata'
      className='aspect-video w-full rounded-2xl bg-surface object-cover'
    />
  );
}

export default VideoPreview;
