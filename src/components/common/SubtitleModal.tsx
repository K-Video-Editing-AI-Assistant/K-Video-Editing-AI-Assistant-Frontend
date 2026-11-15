import { useEffect, useState } from 'react';
import { errorMessage } from '@/api/client';
import { getTranscript } from '@/api/transcript';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useSubtitleStore } from '@/store/useSubtitleStore';
import { useUploadStore } from '@/store/useUploadStore';
import { formatDuration } from '@/utils/formatDuration';

type SubtitleModalProps = { fileName: string; onClose: () => void };

function SubtitleModal({ fileName, onClose }: SubtitleModalProps) {
  const videoId = useUploadStore((state) => state.videoId);
  const saved = useSubtitleStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!videoId) return;
    const controller = new AbortController();
    void getTranscript(videoId, controller.signal)
      .then((segments) => {
        if (controller.signal.aborted) return;
        useSubtitleStore.getState().setSubtitles(
          videoId,
          segments.map((segment, index) => ({
            id: String(index),
            start: segment.startSeconds,
            end: segment.endSeconds,
            text: segment.text,
          })),
        );
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause));
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [videoId, attempt]);
  const subtitles = saved.videoId === videoId ? saved.subtitles : [];
  return (
    <Modal title='전체 자막' width='xl' onClose={onClose}>
      <p className='mb-4 text-section font-bold'>{fileName}</p>
      {loading && <p role='status'>자막을 불러오는 중…</p>}
      {error && (
        <div role='alert'>
          <p className='text-error'>{error}</p>
          <Button
            onClick={() => {
              setError('');
              setLoading(true);
              setAttempt((value) => value + 1);
            }}
          >
            다시 시도
          </Button>
        </div>
      )}
      {!loading && !error && subtitles.length === 0 && <p>추출된 자막이 없어요.</p>}
      {!loading && !error && (
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
      )}
    </Modal>
  );
}
export default SubtitleModal;
