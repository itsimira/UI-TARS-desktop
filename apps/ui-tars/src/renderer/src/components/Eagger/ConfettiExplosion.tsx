import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  xVelocity: number;
  yVelocity: number;
  opacity: number;
};

export default function ConfettiExplosion() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = [
      '#FF5252',
      '#FF4081',
      '#E040FB',
      '#7C4DFF',
      '#536DFE',
      '#448AFF',
      '#40C4FF',
      '#18FFFF',
      '#64FFDA',
      '#69F0AE',
      '#B2FF59',
      '#EEFF41',
      '#FFFF00',
      '#FFD740',
      '#FFAB40',
      '#FF6E40',
    ];

    const newParticles: Particle[] = [];

    // Create 100 particles
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: 0,
        y: 0,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        xVelocity: (Math.random() - 0.5) * 15,
        yVelocity: (Math.random() - 0.5) * 15,
        opacity: 1,
      });
    }

    setParticles(newParticles);

    // Clean up
    return () => {
      setParticles([]);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
          initial={{
            x: 0,
            y: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            x: particle.xVelocity * 20,
            y: particle.yVelocity * 20,
            rotate: particle.rotation,
            opacity: 0,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2 + Math.random(),
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
