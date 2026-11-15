import SegmentPlayer from '@/components/common/SegmentPlayer';
import Button from '@/components/ui/Button';
import Metric from '@/components/ui/Metric';
import Modal from '@/components/ui/Modal';
import type { Segment } from '@/types/segment';
import { formatDuration } from '@/utils/formatDuration';

type PreviewModalProps = {
  segment: Segment;
  file: File; // The full video
  onClose: () => void;
  onDownload?: () => void;
};

function PreviewModal({ segment, file, onClose, onDownload }: PreviewModalProps) {
  return (
    <Modal
      title='구간 미리보기'
      width='lg'
      onClose={onClose}
      footer={
        <Button variant='accentText' disabled={!onDownload} onClick={onDownload}>
          이 구간 다운로드
        </Button>
      }
    >
      <div className='flex flex-col gap-6'>
        <SegmentPlayer file={file} start={segment.start} end={segment.end} />
        <div className='flex gap-3'>
          <Metric
            label='재생'
            value={`${formatDuration(segment.start)} ~ ${formatDuration(segment.end)}`}
          />
          <Metric label='전체' value={formatDuration(segment.end - segment.start)} />
        </div>
      </div>
    </Modal>
  );
}

export default PreviewModal;
