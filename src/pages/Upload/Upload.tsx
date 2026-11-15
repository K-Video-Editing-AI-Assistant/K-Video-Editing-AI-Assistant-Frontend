import { uploadVideo } from '@/api/videos';
import { errorMessage } from '@/api/client';
import { useEffect, useRef, useState } from 'react';
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

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  const handleUpload = async () => {
    if (!file || pending.current) return;
    if (useUploadStore.getState().videoId) {
      navigate('/analysis');
      return;
    }
    pending.current = true;
    setIsUploading(true);
    setError('');
    controller.current = new AbortController();
    try {
      const result = await uploadVideo(file, controller.current.signal);
      if (controller.current.signal.aborted) return;
      useUploadStore.getState().setUploaded(result);
      navigate('/analysis');
    } catch (cause) {
      if (!controller.current.signal.aborted) setError(errorMessage(cause));
    } finally {
      pending.current = false;
      setIsUploading(false);
    }
  };

  return (
    <StepLayout
      currentStep={1}
      title='영상을 업로드하세요'
      leftAction={
        <Button variant='secondary' disabled={isUploading} onClick={() => setIsLeaveOpen(true)}>
          프로젝트 나가기
        </Button>
      }
      rightAction={
        <Button disabled={file === null || isUploading} onClick={handleUpload}>
          {isUploading ? '업로드 중…' : '영상 분석 시작'}
        </Button>
      }
    >
      <div className='flex flex-col gap-6'>
        {error && (
          <p role='alert' className='text-error'>
            {error}
          </p>
        )}
        <fieldset disabled={isUploading}>
          <UploadDropzone hasFile={file !== null} onFileSelect={setFile} />
        </fieldset>
        {file && (
          <FileInfoCard
            name={file.name}
            duration={duration === null ? '--:--' : formatDuration(duration)}
            size={formatFileSize(file.size)}
            // Clearing the file brings back the empty upload state
            onChangeFile={() => {
              if (!pending.current) setFile(null);
            }}
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
