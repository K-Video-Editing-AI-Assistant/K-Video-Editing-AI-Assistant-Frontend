import type { ReactNode } from 'react';
import clsx from 'clsx';
import StepHeader from '@/components/layouts/StepHeader';

type StepLayoutProps = {
  currentStep: number; // 1 to 6
  title: string; // Page title shown at the top of the content
  titleAlign?: 'left' | 'center'; // Defaults to left
  children: ReactNode; // Whatever the page puts inside this layout
  leftAction?: ReactNode; // Footer left side (usually the "previous" button)
  rightAction?: ReactNode; // Footer right side (usually the main action button)
};

function StepLayout({
  currentStep,
  title,
  titleAlign = 'left',
  children,
  leftAction,
  rightAction,
}: StepLayoutProps) {
  return (
    <div className='flex min-h-screen flex-col'>
      <StepHeader currentStep={currentStep} />

      {/* flex-1 makes this area take all the free space, pushing the footer to the bottom */}
      <main className='flex-1 px-12 pt-19'>
        <h1 className={clsx('mb-8 text-title font-bold', titleAlign === 'center' && 'text-center')}>
          {title}
        </h1>
        {children}
      </main>

      <footer className='flex items-center justify-between border-t border-line px-12 py-7'>
        <div>{leftAction}</div>
        <div className='flex gap-4'>{rightAction}</div>
      </footer>
    </div>
  );
}

export default StepLayout;
