import { useEffect } from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';

// Width of the card. Matches the Figma modals (640 / 720 / 960 / 1080 px).
const WIDTHS = {
  sm: 'max-w-160',
  md: 'max-w-180',
  lg: 'max-w-240',
  xl: 'max-w-270',
};

type ModalProps = {
  title: string;
  onClose: () => void; // Called for the X button, the Esc key and a click on the dark background
  width?: keyof typeof WIDTHS;
  titleTone?: 'default' | 'error'; // "error" shows the title in red
  children: ReactNode; // The content between the title and the buttons
  footer?: ReactNode; // Buttons shown at the bottom right
};

function Modal({
  title,
  onClose,
  width = 'md',
  titleTone = 'default',
  children,
  footer,
}: ModalProps) {
  // Close the modal when the Esc key is pressed
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    // Cleanup: stop listening when the modal disappears
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    // Dark background covering the whole screen. Clicking it closes the modal.
    <div
      onClick={onClose}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6'
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-label={title}
        // Clicks inside the card must not reach the dark background below
        onClick={(event) => event.stopPropagation()}
        className={clsx(
          'flex max-h-full w-full flex-col gap-6 rounded-2xl border border-line bg-surface p-8',
          WIDTHS[width],
        )}
      >
        <div className='flex items-center justify-between'>
          <h2
            className={clsx(
              'text-2xl leading-9 font-bold',
              titleTone === 'error' ? 'text-error' : 'text-fg',
            )}
          >
            {title}
          </h2>
          <button
            type='button'
            aria-label='닫기'
            onClick={onClose}
            className='flex size-8 cursor-pointer items-center justify-center text-xl text-muted hover:text-fg'
          >
            ✕
          </button>
        </div>

        {/* min-h-0 + overflow-y-auto let long content scroll inside the card */}
        <div className='min-h-0 flex-1 overflow-y-auto'>{children}</div>

        {footer && <div className='flex justify-end gap-4'>{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
