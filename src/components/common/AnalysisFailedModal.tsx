import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import VideoPreview from '@/components/common/VideoPreview';

type AnalysisFailedModalProps = {
  file: File; // The video that failed, shown blurred behind the warning icon
  onChangeFile: () => void; // "파일 바꾸기"
  onRetry: () => void; // "다시 분석"
  onClose: () => void; // The X button, Esc, or a click on the dark background
};

function AnalysisFailedModal({ file, onChangeFile, onRetry, onClose }: AnalysisFailedModalProps) {
  return (
    <Modal
      title='영상을 분석하지 못했어요'
      titleTone='error'
      onClose={onClose}
      footer={
        <>
          <Button variant='secondary' onClick={onChangeFile}>
            파일 바꾸기
          </Button>
          <Button onClick={onRetry}>다시 분석</Button>
        </>
      }
    >
      <div className='flex flex-col gap-4'>
        {/* overflow-hidden keeps the blurred edges inside the rounded box */}
        <div className='relative overflow-hidden rounded-lg'>
          <VideoPreview file={file} className='h-60 w-full blur-sm brightness-50' />
          <div className='absolute inset-0 flex items-center justify-center'>
            <span
              aria-hidden='true'
              className='flex size-20 items-center justify-center rounded-full border-2 border-error text-4xl font-bold text-error'
            >
              !
            </span>
          </div>
        </div>

        <p className='rounded-lg border border-line bg-raised px-4 py-4 text-value font-bold'>
          {file.name}
        </p>
        <p className='text-lg text-muted'>영상과 추출된 자막은 유지됩니다.</p>
      </div>
    </Modal>
  );
}

export default AnalysisFailedModal;
