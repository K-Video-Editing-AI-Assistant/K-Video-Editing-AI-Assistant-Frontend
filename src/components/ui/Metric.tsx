import clsx from 'clsx';

// The data this component needs. label and value must be text.
type MetricProps = {
  label: string;
  value: string;
  tone?: 'default' | 'success'; // "success" shows the value in green
};

function Metric({ label, value, tone = 'default' }: MetricProps) {
  return (
    <div className='flex h-13 items-center gap-3 rounded-lg border border-line bg-raised px-4'>
      <span className='text-base text-muted'>{label}</span>
      <span
        className={clsx('text-value font-bold', tone === 'success' ? 'text-success' : 'text-fg')}
      >
        {value}
      </span>
    </div>
  );
}

export default Metric;
