import Modal from '@/components/ui/Modal';
import { useSubtitleStore } from '@/store/useSubtitleStore';
import { formatDuration } from '@/utils/formatDuration';

type SubtitleModalProps = {
  fileName: string; // Shown above the subtitle list
  onClose: () => void; // The X button, Esc, or a click on the dark background
};

function SubtitleModal({ fileName, onClose }: SubtitleModalProps) {
  const subtitles = useSubtitleStore((state) => state.subtitles);

  return (
    <Modal title='전체 자막' width='xl' onClose={onClose}>
      <p className='mb-4 text-section font-bold'>{fileName}</p>
      {/* The Modal scrolls its content by itself when the list is longer than the screen */}
      <ul className='flex flex-col gap-2'>
        {subtitles.map((subtitle) => (
          <li
            key={subtitle.id}
            className='flex gap-8 rounded-lg border border-line bg-raised px-4 py-4'
          >
            <span className='w-16 shrink-0 text-lg font-bold'>
              {formatDuration(subtitle.start)}
            </span>
            <span className='text-lg'>{subtitle.text}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

export default SubtitleModal;
