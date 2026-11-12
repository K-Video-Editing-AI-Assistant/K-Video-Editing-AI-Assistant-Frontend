import clsx from 'clsx';
import VideoPreview from '@/components/common/VideoPreview';
import Button from '@/components/ui/Button';
import Metric from '@/components/ui/Metric';
import type { Segment } from '@/types/segment';
import { formatDuration } from '@/utils/formatDuration';

type SegmentCardProps = {
  segment: Segment;
  file: File; // The full video, used to show the segment's first frame
  selected: boolean; // true = ticked (yellow border and filled circle)
  onToggle: () => void; // Called when the circle is clicked
  onPreview?: () => void; // Called when "미리보기" is clicked
  onDownload?: () => void; // Called when "다운로드" is clicked
};

function SegmentCard({
  segment,
  file,
  selected,
  onToggle,
  onPreview,
  onDownload,
}: SegmentCardProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-6 rounded-2xl border bg-surface px-6 py-4',
        selected ? 'border-accent' : 'border-line',
      )}
    >
      {/* Selection circle. It works like a checkbox. */}
      <button
        type='button'
        role='checkbox'
        aria-checked={selected}
        aria-label={`${segment.title} 선택`}
        onClick={onToggle}
        className={clsx(
          'flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 text-sm font-bold',
          selected ? 'border-accent bg-accent text-ink' : 'border-subtle',
        )}
      >
        {selected && '✓'}
      </button>

      {/* Thumbnail: the frame where this segment starts */}
      <VideoPreview file={file} startAt={segment.start} className='h-20 w-32 shrink-0 rounded-lg' />

      <div className='flex flex-1 flex-col gap-2'>
        <p className='text-lg font-bold'>{segment.title}</p>
        <div className='flex gap-2'>
          <Metric label='시작' value={formatDuration(segment.start)} />
          <Metric label='종료' value={formatDuration(segment.end)} />
          <Metric label='길이' value={`${segment.end - segment.start}초`} />
        </div>
      </div>

      <div className='flex gap-2 self-start'>
        <Button variant='secondary' onClick={onPreview}>
          미리보기
        </Button>
        <Button variant='accentText' onClick={onDownload}>
          다운로드
        </Button>
      </div>
    </div>
  );
}

export default SegmentCard;
