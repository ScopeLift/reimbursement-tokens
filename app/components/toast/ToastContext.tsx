import { useEffect, FC } from 'react';
import { createContext, useState } from 'react';

type ContextProps = {
  content: string;
  visible: boolean;
  timeout: number;
  type: 'success' | 'error';
  setToast: Function;
  clearToast: Function;
};

export const ToastContext = createContext<Partial<ContextProps>>({
  content: '',
  visible: false,
  timeout: 5000,
  type: 'error',
  setToast: () => {},
  clearToast: () => {},
});

export const WithToast = ({ children }: { children: FC }) => {
  const [content, setContent] = useState<string>('');
  const [visible, setVisible] = useState(false);
  const [timeout, setTheTimeout] = useState(5000);
  const [type, setType] = useState<'success' | 'error'>('error');

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), timeout);
    return () => {
      setVisible(false);
      clearTimeout(timer);
    };
  }, [content, timeout, type]);

  const setToast = ({ type, content, timeout }: { type: 'success' | 'error'; content: string; timeout: number }) => {
    setContent(content);
    setVisible(true);
    setType(type);
    setTheTimeout(timeout || 5000);
  };

  const clearToast = () => {
    setVisible(false);
  };

  return (
    <ToastContext.Provider
      value={{
        content,
        visible,
        timeout,
        type,
        setToast,
        clearToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};
