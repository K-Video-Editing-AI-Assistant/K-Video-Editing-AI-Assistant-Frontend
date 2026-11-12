import { useEffect, useRef } from 'react';

type SegmentPlayerProps = {
  file: File; // The full video
  start: number; // Segment start in seconds
  end: number; // Segment end in seconds
  subtitle?: string; // Text shown over the bottom of the video
};

function SegmentPlayer({ file, start, end, subtitle }: SegmentPlayerProps) {
  // Points to the <video> element so we can give it the file below
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // A temporary address that lets the <video> element read the local file
    const url = URL.createObjectURL(file);
    // "#t=start,end" tells the browser to play only this part of the video
    video.src = `${url}#t=${start},${end}`;

    // Cleanup: free the temporary address when the segment changes or the page closes
    return () => URL.revokeObjectURL(url);
  }, [file, start, end]);

  return (
    <div className='relative overflow-hidden rounded-2xl bg-surface'>
      <video
        ref={videoRef}
        controls
        preload='metadata'
        className='aspect-video w-full bg-black object-contain'
      />
      {subtitle && (
        // pointer-events-none lets clicks pass through to the video controls underneath
        <p className='pointer-events-none absolute inset-x-12 bottom-14 rounded-lg bg-bg/90 px-4 py-2 text-center text-base'>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SegmentPlayer;
