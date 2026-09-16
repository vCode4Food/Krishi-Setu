import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Headless carousel built on a scroll container: drag/swipe comes free from
 * native scrolling, while the hook adds arrow control and progress state.
 */
export const useCarousel = () => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const [pages, setPages] = useState(1);

  const recompute = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const count = el.children.length;
    const perView = Math.max(1, Math.round(el.clientWidth / (el.firstElementChild?.clientWidth || 1)));
    setPages(Math.max(1, count - perView + 1));
    const child = el.children[index] as HTMLElement | undefined;
    // keep index within bounds after resize
    if (index > count - 1) setIndex(Math.max(0, count - 1));
    else if (child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, [index]);

  useEffect(() => {
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [recompute]);

  const scrollToIndex = useCallback(
    (i: number) => {
      const el = trackRef.current;
      if (!el) return;
      const child = el.children[i] as HTMLElement | undefined;
      if (!child) return;
      el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
      setIndex(i);
    },
    [],
  );

  const next = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.children.length - 1;
    scrollToIndex(Math.min(max, index + 1));
  }, [index, scrollToIndex]);

  const prev = useCallback(() => {
    scrollToIndex(Math.max(0, index - 1));
  }, [index, scrollToIndex]);

  return { trackRef, index, pages, next, prev, scrollToIndex };
};
