import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

// Accepts every normal <button> attribute (onClick, disabled, ...) plus our own options.
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'accentText'; // accentText = dark button with yellow text
  size?: 'md' | 'sm'; // md = 52px tall, sm = 40px tall
};

function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      type='button'
      className={clsx(
        // Shared style
        'cursor-pointer rounded-lg font-bold',
        // Per-size style
        size === 'md' && 'h-13 px-8 text-section',
        size === 'sm' && 'h-10 px-4 text-base',
        // Disabled style
        'disabled:cursor-not-allowed disabled:bg-raised disabled:text-subtle',
        // Per-variant colors
        variant === 'primary' && 'bg-accent text-ink',
        variant === 'secondary' && 'border border-line bg-raised text-fg',
        variant === 'accentText' && 'border border-line bg-raised text-accent',
        // Extra classes passed in by the parent
        className,
      )}
      {...props}
    />
  );
}

export default Button;
