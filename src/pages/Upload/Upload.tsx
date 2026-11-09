import StepLayout from '@/components/layouts/StepLayout';
import Button from '@/components/ui/Button';

function Upload() {
  return (
    <StepLayout
      currentStep={1}
      title='영상을 업로드하세요'
      leftAction={<Button variant='secondary'>프로젝트 나가기</Button>}
      rightAction={<Button>영상 분석 시작</Button>}
    >
      <p className='text-muted'>업로드 영역이 들어갈 자리</p>
    </StepLayout>
  );
}

export default Upload;
