import { useEffect } from 'react';

export const useOutsideAlerter = (refs: React.MutableRefObject<any>[], onClickOutside:() => void) => {
  useEffect(() => {
    const handler = (event: any) => {
      const inside = [];
      refs.filter(ref => ref.current).forEach(ref => {
        const parent = $(ref.current.parentElement);
        const target = $(event.target);

        if (!target.closest(parent).length || target.closest(event).length) {
          inside.push(false);
        } else {
          inside.push(true);
        }
      });

      if (inside.every(i => !i)) {
        onClickOutside();
      }
    }

    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [refs]);
}