import { getRefElement } from '@/functions';
import { RefObject, useCallback, useEffect, useRef } from 'react';

interface UseEventListener {
  type: keyof WindowEventMap;
  element?: RefObject<Element> | HTMLElement | Document | Window | null;
  listener: (event: MouseEvent) => void;
  options?: AddEventListenerOptions;
}

const useEventListener = ({ type, element, listener, options }: UseEventListener): void => {
  const savedListener = useRef<(event: MouseEvent) => void | null>(null);

  useEffect(() => {
    savedListener.current = listener;
  }, [listener]);

  const handleEventListener = useCallback((event: Event) => {
    savedListener.current?.(event as MouseEvent);
  }, []);

  useEffect(() => {
    const target = getRefElement(element);

    target?.addEventListener(type, handleEventListener, options);

    return () => target?.removeEventListener(type, handleEventListener);
  }, [type, element, options, handleEventListener]);
};

export default useEventListener;
