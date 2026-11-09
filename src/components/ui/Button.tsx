import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

// Accepts every normal <button> attribute (onClick, disabled, ...) plus our own "variant".
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      type='button'
      className={clsx(
        // Shared style (52px tall, 8px corners, bold 20px text)
        'h-13 cursor-pointer rounded-lg px-8 text-section font-bold',
        // Disabled style
        'disabled:cursor-not-allowed disabled:bg-raised disabled:text-subtle',
        // Per-variant colors
        variant === 'primary' && 'bg-accent text-ink',
        variant === 'secondary' && 'border border-line bg-raised text-fg',
        // Extra classes passed in by the parent
        className,
      )}
      {...props}
    />
  );
}

export default Button;
