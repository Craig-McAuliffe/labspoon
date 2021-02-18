import {useEffect} from 'react';

export default function useDomRemover(className) {
  useEffect(
    () => () => {
      const domElement = document.querySelector(className);
      if (domElement) domElement.remove();
    },
    [className]
  );
}
