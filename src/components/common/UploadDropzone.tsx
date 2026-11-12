import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import clsx from 'clsx';
import Button from '@/components/ui/Button';

type UploadDropzoneProps = {
  hasFile: boolean; // Changes the button text
  onFileSelect: (file: File) => void; // Called when the user picks a valid video
};

const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

function UploadDropzone({ hasFile, onFileSelect }: UploadDropzoneProps) {
  // Points to the hidden <input type="file"> so the button can open it
  const inputRef = useRef<HTMLInputElement>(null);
  // True while a file is being dragged over the box
  const [isDragging, setIsDragging] = useState(false);

  // Only pass video files on to the parent
  const handleFile = (file: File | undefined) => {
    if (file && ACCEPTED_TYPES.includes(file.type)) {
      onFileSelect(file);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
    // Reset so picking the same file twice still triggers a change
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files[0]);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Required, otherwise the browser refuses drops
    setIsDragging(true);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={clsx(
        'flex h-65 flex-col items-center justify-center gap-3 rounded-2xl border bg-surface',
        isDragging ? 'border-accent' : 'border-line',
      )}
    >
      <span className='text-title text-accent'>↑</span>
      <p className='text-section font-bold'>여기에 영상을 끌어다 놓으세요</p>
      <p className='text-base text-muted'>MP4, MOV, WEBM · 영상 파일 1개</p>
      <Button variant='secondary' onClick={() => inputRef.current?.click()}>
        {hasFile ? '파일 바꾸기' : '파일 선택'}
      </Button>
      <input
        ref={inputRef}
        type='file'
        accept='video/mp4,video/quicktime,video/webm'
        className='hidden'
        onChange={handleChange}
      />
    </div>
  );
}

export default UploadDropzone;
