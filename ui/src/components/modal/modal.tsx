import { XMarkIcon } from '@heroicons/react/24/solid';
import { ReactNode } from 'react';

export interface ModalProps {
  title: string;
  setIsOpen: (isOpen: boolean) => void;
  body: ReactNode;
  footer?: ReactNode;
}

export const Modal = ({ title, setIsOpen, body, footer }: ModalProps) => {
  return (
    <>
      <div className="modal-overlay" onClick={() => setIsOpen(false)} />
      <div className="modal-container">
        <div className="modal-main">
          <div className="modal-heading">
            <h5 className="modal-title">{title}</h5>
            <button
              className="modal-close-btn"
              onClick={() => setIsOpen(false)}
            >
              <XMarkIcon />
            </button>
          </div>
          <div className="modal-body">{body}</div>
          {footer ? <div className="modal-footer">{footer}</div> : <></>}
        </div>
      </div>
    </>
  );
};

export default Modal;
