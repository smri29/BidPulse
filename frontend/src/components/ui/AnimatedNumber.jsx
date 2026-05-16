import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'motion';
import { useInView } from 'motion/react';

// Dashboard KPI helper that counts up once the number scrolls into view.
const AnimatedNumber = ({ value = 0, duration = 0.9, className = '' }) => {
  const nodeRef = useRef(null);
  const currentValueRef = useRef(0);
  const isInView = useInView(nodeRef, { once: true, margin: '-10% 0px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return undefined;

    // API values may arrive as strings, so coerce safely before animating.
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
    const controls = animate(currentValueRef.current, safeValue, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        const rounded = Math.round(latest);
        currentValueRef.current = rounded;
        setDisplay(rounded);
      },
    });

    return () => controls.stop();
  }, [duration, isInView, value]);

  return (
    <span ref={nodeRef} className={className}>
      {display.toLocaleString()}
    </span>
  );
};

export default AnimatedNumber;
