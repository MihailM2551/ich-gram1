import { useCallback, useRef } from "react";

export const useInfiniteScroll = (enabled: boolean, onLoadMore: () => void) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  return useCallback(
    (node: HTMLDivElement | null) => {
      if (!enabled) {
        return;
      }

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [enabled, onLoadMore],
  );
};
