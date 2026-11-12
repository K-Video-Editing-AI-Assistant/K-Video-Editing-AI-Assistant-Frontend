import StepLayout from '@/components/layouts/StepLayout';
import Button from '@/components/ui/Button';
import Metric from '@/components/ui/Metric';

function Home() {
  return (
    <StepLayout
      currentStep={1}
      title='영상을 업로드하세요'
      leftAction={<Button variant='secondary'>프로젝트 나가기</Button>}
      rightAction={<Button>영상 분석 시작</Button>}
    >
      <div className='flex gap-4'>
        <Metric label='길이' value='12:30' />
        <Metric label='크기' value='128 MB' />
      </div>
    </StepLayout>
  );
}

export default Home;
