import Step from '@/components/layouts/Step';

// Step names in order. The number is the position in this list (1 to 6).
const STEPS = ['업로드', '분석', '장면 찾기', '구간 선택', '편집', '다운로드'];

type StepHeaderProps = {
  currentStep: number; // 1 to 6
};

// Decide how each step should look compared to the current one
function getStatus(number: number, currentStep: number) {
  if (number < currentStep) return 'done';
  if (number === currentStep) return 'current';
  return 'upcoming';
}

function StepHeader({ currentStep }: StepHeaderProps) {
  return (
    <header className='flex h-22 items-center justify-center border-b border-line'>
      <ol className='flex gap-2'>
        {STEPS.map((label, index) => {
          const number = index + 1;
          return (
            <li key={label}>
              <Step number={number} label={label} status={getStatus(number, currentStep)} />
            </li>
          );
        })}
      </ol>
    </header>
  );
}

export default StepHeader;
