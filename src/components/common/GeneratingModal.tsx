import Metric from '@/components/ui/Metric';
import Modal from '@/components/ui/Modal';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatDuration } from '@/utils/formatDuration';

type GeneratingModalProps = {
  fileName: string; // Name of the video being made, e.g. "lecture_편집본.mp4"
  segmentCount: number;
  totalSeconds: number;
  progress: number; // 0 to 100
  onClose: () => void; // Called on Esc, the X button and a click outside (cancels)
};

function GeneratingModal({
  fileName,
  segmentCount,
  totalSeconds,
  progress,
  onClose,
}: GeneratingModalProps) {
  return (
    <Modal title='영상 생성 중' width='md' onClose={onClose}>
      <div className='flex flex-col gap-6'>
        <p className='text-section font-bold break-all'>{fileName}</p>
        <div className='flex gap-3'>
          <Metric label='구간' value={`${segmentCount}개`} />
          <Metric label='길이' value={formatDuration(totalSeconds)} />
        </div>
        <p className='text-muted'>영상과 자막 저장 중</p>
        <div className='flex flex-col gap-3'>
          <Metric label='진행률' value={`${progress}%`} tone='success' />
          <ProgressBar value={progress} />
        </div>
      </div>
    </Modal>
  );
}

export default GeneratingModal;
