import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type OptionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean; // true = this option is the chosen one (yellow border)
};

function OptionButton({ selected, className, ...props }: OptionButtonProps) {
  return (
    <button
      type='button'
      // Tells screen readers whether this option is currently chosen
      aria-pressed={selected}
      className={clsx(
        'h-13 w-full cursor-pointer rounded-lg border bg-raised text-section font-bold text-fg',
        selected ? 'border-accent' : 'border-line',
        className,
      )}
      {...props}
    />
  );
}

export default OptionButton;
