import React, { useEffect, useRef, useState } from 'react';

const Reveal = ({
  as: Tag = 'div',
  className = '',
  children,
  delay = 0,
  y = 20,
  once = true,
}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return undefined;

    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setVisible(false);
        }
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.15,
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={{
        '--reveal-y': `${y}px`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
