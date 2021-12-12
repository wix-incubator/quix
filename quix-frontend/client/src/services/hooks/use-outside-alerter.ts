import { useEffect } from 'react';

export const useOutsideAlerter = (refs: React.MutableRefObject<any>[], onClickOutside:() => void) => {
  useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      const handleClickOutside = (event: any) => {
        const isOutside = [];
        refs.forEach(ref => {
            if (ref.current && !ref.current.contains(event.target)) {
                isOutside.push(true);
            } else {
                isOutside.push(false);
            }
        });
        if (isOutside.every(i => i)) {
            onClickOutside();
        }
      }

      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          // Unbind the event listener on clean up
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, [refs]);
}