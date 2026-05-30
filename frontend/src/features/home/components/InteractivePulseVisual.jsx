/**
 * Module: features/home/components/InteractivePulseVisual.jsx
 * Purpose: Presents the Interactive Pulse Visual UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

const InteractivePulseVisual = () => {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 16 });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 16 });

  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    pointerX.set(x);
    pointerY.set(y);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.div
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="relative h-40 overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700"
    >
      <motion.div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/40 blur-xl" animate={{ scale: [0.95, 1.2, 0.95], opacity: [0.45, 0.85, 0.45] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute left-10 top-8 h-12 w-12 rounded-full border border-white/40" animate={{ y: [0, 10, 0], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-7 right-12 h-14 w-14 rounded-full border border-cyan-200/60" animate={{ y: [0, -11, 0], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2.9, repeat: Infinity, ease: 'easeInOut' }} />
      <div className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-wider text-cyan-100/90">Interactive Market Pulse</div>
    </motion.div>
  );
};

export default InteractivePulseVisual;
