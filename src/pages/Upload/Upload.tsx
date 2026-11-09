import { useState } from 'react';
import StepLayout from '@/components/layouts/StepLayout';
import UploadDropzone from '@/components/common/UploadDropzone';
import FileInfoCard from '@/components/common/FileInfoCard';
import Button from '@/components/ui/Button';
import { useVideoDuration } from '@/hooks/useVideoDuration';
import { formatDuration } from '@/utils/formatDuration';
import { formatFileSize } from '@/utils/formatFileSize';

function Upload() {
  // The video the user picked (null = nothing picked yet)
  const [file, setFile] = useState<File | null>(null);
  // Video length in seconds (null while loading)
  const duration = useVideoDuration(file);

  return (
    <StepLayout
      currentStep={1}
      title='영상을 업로드하세요'
      leftAction={<Button variant='secondary'>프로젝트 나가기</Button>}
      rightAction={<Button disabled={file === null}>영상 분석 시작</Button>}
    >
      <div className='flex flex-col gap-6'>
        <UploadDropzone hasFile={file !== null} onFileSelect={setFile} />
        {file && (
          <FileInfoCard
            name={file.name}
            duration={duration === null ? '--:--' : formatDuration(duration)}
            size={formatFileSize(file.size)}
            // Clearing the file brings back the empty upload state
            onChangeFile={() => setFile(null)}
          />
        )}
      </div>
    </StepLayout>
  );
}

export default Upload;
