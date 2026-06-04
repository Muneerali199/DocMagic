import { useEffect, useRef, useState } from "react";

interface AuditResult {
  isOverflowing: boolean;
  overflowRatio: number;
}

/**
 * Custom hook to monitor DOM containers for content overflow.
 * Useful for tracking real-time AI streaming text adjustments.
 * * @param dependencies Array of values that trigger a layout re-evaluation when changed.
 */
export const useLayoutAuditor = (dependencies: any[]) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [layoutState, setLayoutState] = useState<AuditResult>({
    isOverflowing: false,
    overflowRatio: 1,
  });

  useEffect(() => {
    const checkOverflow = () => {
      const element = containerRef.current;
      if (!element) return;

      // Detect if content overflows vertically or horizontally
      const hasOverflow =
        element.scrollHeight > element.clientHeight ||
        element.scrollWidth > element.clientWidth;

      // Calculate how much text needs to scale down to fit perfectly (1 = perfect fit)
      const ratio = hasOverflow
        ? element.clientHeight / element.scrollHeight
        : 1;

      setLayoutState({
        isOverflowing: hasOverflow,
        overflowRatio: ratio,
      });
    };

    // Use ResizeObserver to continuously track layout shifts as AI populates text
    const resizeObserver = new ResizeObserver(() => checkOverflow());

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Run the initial check
    checkOverflow();

    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { containerRef, ...layoutState };
};
