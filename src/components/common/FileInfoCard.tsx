import Button from '@/components/ui/Button';
import Metric from '@/components/ui/Metric';

type FileInfoCardProps = {
  name: string; // e.g. "숲_강의.mp4"
  duration: string; // e.g. "12:30"
  size: string; // e.g. "128 MB"
  onChangeFile: () => void; // Called when the user clicks "파일 변경"
};

// This component only displays what it is given. It does not read the file itself.
function FileInfoCard({ name, duration, size, onChangeFile }: FileInfoCardProps) {
  return (
    <div className='flex items-center gap-8 rounded-2xl border border-line bg-surface px-6 py-11'>
      <p className='text-value font-bold'>{name}</p>
      <div className='flex gap-2'>
        <Metric label='길이' value={duration} />
        <Metric label='크기' value={size} />
      </div>
      {/* ml-auto pushes the button to the far right */}
      <Button className='ml-auto' onClick={onChangeFile}>
        파일 변경
      </Button>
    </div>
  );
}

export default FileInfoCard;
