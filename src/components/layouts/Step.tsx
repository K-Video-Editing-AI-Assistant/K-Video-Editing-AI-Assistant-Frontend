import clsx from 'clsx';

type StepProps = {
  number: number; // 1 to 6
  label: string;
  status: 'done' | 'current' | 'upcoming';
};

function Step({ number, label, status }: StepProps) {
  // Finished steps show a check mark, others show a two-digit number (01, 02, ...)
  const prefix = status === 'done' ? '✓' : String(number).padStart(2, '0');

  return (
    <div
      // Tells screen readers which step is the current one
      aria-current={status === 'current' ? 'step' : undefined}
      className={clsx(
        // 140px wide, 44px tall, content centered
        'flex h-11 w-35 items-center justify-center gap-1.5 rounded-lg text-base',
        status === 'done' && 'text-fg',
        status === 'current' && 'bg-raised text-accent',
        status === 'upcoming' && 'text-subtle',
      )}
    >
      <span>{prefix}</span>
      <span>{label}</span>
    </div>
  );
}

export default Step;
