import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

type LeaveProjectModalProps = {
  onCancel: () => void; // "계속 편집", the X button, Esc, or a click on the dark background
  onConfirm: () => void; // "나가기"
};

function LeaveProjectModal({ onCancel, onConfirm }: LeaveProjectModalProps) {
  return (
    <Modal
      title='프로젝트에서 나갈까요?'
      width='sm'
      onClose={onCancel}
      footer={
        <>
          <Button variant='secondary' onClick={onCancel}>
            계속 편집
          </Button>
          <Button variant='danger' onClick={onConfirm}>
            나가기
          </Button>
        </>
      }
    >
      <p className='text-lg text-muted'>편집 중인 내용이 사라질 수 있어요.</p>
    </Modal>
  );
}

export default LeaveProjectModal;
