import { useRef, useEffect } from 'react';
import { ToasterRef } from '@/components/ui/toast-modern';

// Global singleton reference
let globalToasterRef: React.RefObject<ToasterRef> | null = null;

export const useToastModern = () => {
  const toasterRef = useRef<ToasterRef>(null);

  useEffect(() => {
    // Set the global reference when component mounts
    globalToasterRef = toasterRef;
    
    return () => {
      // Clean up on unmount
      if (globalToasterRef === toasterRef) {
        globalToasterRef = null;
      }
    };
  }, []);

  return toasterRef;
};

// Export a function to access the global toast from anywhere
export const showToast = (props: Parameters<ToasterRef['show']>[0]) => {
  if (globalToasterRef?.current) {
    globalToasterRef.current.show(props);
  } else {
    console.warn('ToasterModern not mounted. Make sure to include <ToasterModern /> in your app.');
  }
};
