import clsx from 'clsx';

type SegmentOrderItemProps = {
  order: number; // Position in the merge order, starting from 1
  title: string;
  seconds: number; // Segment length in seconds
  active: boolean; // true = this is the segment shown in the player (yellow border)
  onClick: () => void; // Called when the item is clicked
};

function SegmentOrderItem({ order, title, seconds, active, onClick }: SegmentOrderItemProps) {
  return (
    <button
      type='button'
      // Tells screen readers which item is the current one
      aria-current={active ? 'true' : undefined}
      onClick={onClick}
      className={clsx(
        'flex h-23 w-full cursor-pointer items-center gap-3 rounded-xl border bg-surface px-4 text-left',
        active ? 'border-accent' : 'border-line',
      )}
    >
      <span className='shrink-0 text-section font-bold text-muted'>
        {String(order).padStart(2, '0')}
      </span>
      {/* min-w-0 + truncate cut long titles with "..." instead of breaking the layout */}
      <span className='min-w-0 flex-1 truncate text-section font-bold'>{title}</span>
      <span className='shrink-0 text-section font-bold text-muted'>{seconds}초</span>
      {/* Decorative drag handle. Reordering uses the "앞으로 / 뒤로" buttons for now. */}
      <span aria-hidden='true' className='shrink-0 text-muted'>
        ⋮⋮
      </span>
    </button>
  );
}

export default SegmentOrderItem;
