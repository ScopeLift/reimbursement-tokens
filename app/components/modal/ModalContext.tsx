import { createContext, ReactNode, useState } from 'react';
import { Modal } from './Modal';

type ContextProps = {
  clearModal: () => void;
  setModal: ({ content, canClose, style }: { content: ReactNode; canClose?: boolean; style?: string }) => void;
};

export const ModalContext = createContext<ContextProps>({
  clearModal: () => undefined,
  setModal: () => undefined,
});

export const WithModal = ({ children }: { children: ReactNode }) => {
  const [visible, setModalVisible] = useState(false);
  const [content, setModalContent] = useState<ReactNode>();
  const [canClose, setCanClose] = useState(true);
  const [style, setStyle] = useState('');
  const clearModal = () => {
    setModalVisible(false);
    setModalContent(<div></div>);
  };

  const setModal = ({
    content,
    canClose = true,
    style,
  }: {
    content: ReactNode;
    canClose?: boolean;
    style?: string;
  }) => {
    setModalContent(content);
    setModalVisible(true);
    setStyle(style);
    setCanClose(canClose);
  };

  return (
    <ModalContext.Provider
      value={{
        clearModal,
        setModal,
      }}
    >
      <Modal open={visible} styleClass={style} canClose={canClose} setOpen={setModalVisible}>
        {content}
      </Modal>
      {children}
    </ModalContext.Provider>
  );
};
