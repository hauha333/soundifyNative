import { RefObject } from 'react';

export const getRefElement = <T>(
  element?: RefObject<Element> | T
): Element | T | undefined | null => {
  if (element && typeof element === 'object') {
    if ('current' in element) {
      return element.current;
    }
  }
  return element;
};
