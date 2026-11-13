import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepLayout from '@/components/layouts/StepLayout';
import FileInfoCard from '@/components/common/FileInfoCard';
import LeaveProjectModal from '@/components/common/LeaveProjectModal';
import UploadDropzone from '@/components/common/UploadDropzone';
import Button from '@/components/ui/Button';
import { useVideoDuration } from '@/hooks/useVideoDuration';
import { useUploadStore } from '@/store/useUploadStore';
import { formatDuration } from '@/utils/formatDuration';
import { formatFileSize } from '@/utils/formatFileSize';

function Upload() {
  // Lets us move to another page from code
  const navigate = useNavigate();
  // The picked video lives in a shared store, so other pages can read it too
  const file = useUploadStore((state) => state.file);
  const setFile = useUploadStore((state) => state.setFile);
  // Video length in seconds (null while loading)
  const duration = useVideoDuration(file);
  // Whether the "leave project" modal is open
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  return (
    <StepLayout
      currentStep={1}
      title='영상을 업로드하세요'
      leftAction={
        <Button variant='secondary' onClick={() => setIsLeaveOpen(true)}>
          프로젝트 나가기
        </Button>
      }
      rightAction={
        <Button disabled={file === null} onClick={() => navigate('/analysis')}>
          영상 분석 시작
        </Button>
      }
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

      {isLeaveOpen && (
        <LeaveProjectModal
          onCancel={() => setIsLeaveOpen(false)}
          onConfirm={() => {
            // TODO: decide where "leave" should go with the team. For now it clears the video.
            setFile(null);
            setIsLeaveOpen(false);
          }}
        />
      )}
    </StepLayout>
  );
}

export default Upload;