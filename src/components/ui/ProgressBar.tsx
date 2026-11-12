type ProgressBarProps = {
  value: number; // 0 to 100
};

function ProgressBar({ value }: ProgressBarProps) {
  // Keep the number inside 0 to 100 so the bar never overflows
  const percent = Math.min(100, Math.max(0, value));

  return (
    <div
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className='h-2 w-full overflow-hidden rounded-full bg-raised'
    >
      {/* The yellow part. Its width changes with the value. */}
      <div
        className='h-full rounded-full bg-accent transition-[width] duration-300'
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export default ProgressBar;
