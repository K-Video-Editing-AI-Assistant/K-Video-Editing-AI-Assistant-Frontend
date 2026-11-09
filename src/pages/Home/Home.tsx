import Button from '@/components/ui/Button';
import Metric from '@/components/ui/Metric';

function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-4'>
      <h1 className='text-title font-bold'>K-Video Editing AI Assistant</h1>
      <div className='flex gap-4'>
        <Button>영상 분석 시작</Button>
        <Button variant='secondary'>이전 단계</Button>
        <Button disabled>분석 중…</Button>
      </div>
      <div className='flex gap-4'>
        <Metric label='길이' value='12:30' />
        <Metric label='크기' value='128 MB' />
        <Metric label='선택' value='2개' tone='success' />
      </div>
    </main>
  );
}

export default Home;
