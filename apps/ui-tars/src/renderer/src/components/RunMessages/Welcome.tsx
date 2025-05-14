import logo from '@resources/logo-full.png?url';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ConfettiExplosion from '@renderer/components/Eagger/ConfettiExplosion';

export const WelcomePage = () => {
  const [clickCount, setClickCount] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 5) {
      setShowAnimation(true);
      // Reset after animation completes
      setTimeout(() => {
        setClickCount(0);
        setShowAnimation(false);
      }, 4000);
    }
  };

  return (
    <div className="h-2/5 flex items-end">
      <div className="w-full text-center flex flex-col items-center pb-8">
        <AnimatePresence>
          {showAnimation && <ConfettiExplosion />}
        </AnimatePresence>

        <motion.div
          animate={
            showAnimation
              ? {
                  scale: [1, 1.2, 0.9, 1.1, 1],
                  rotate: [0, 10, -10, 5, 0],
                }
              : {}
          }
          transition={{ duration: 1.5 }}
          className="relative z-10"
        >
          <img onClick={handleClick} src={logo} alt="logo" className="h-20" />
        </motion.div>
      </div>
    </div>
  );
};
