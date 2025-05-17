import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
}

const ParallaxCard: React.FC<ParallaxCardProps> = ({ 
  children, 
  className = "",
  depth = 20
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Mouse position values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth springs
  const springConfig = { damping: 20, stiffness: 300 };
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);
  const z = useSpring(0, springConfig);
  
  // Transform mouse position into rotation values
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      if (!cardRef.current || !isHovered) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate normalized position (-1 to 1)
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      
      mouseX.set(x);
      mouseY.set(y);
    };
    
    window.addEventListener('mousemove', updateMousePosition);
    
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, [isHovered, mouseX, mouseY]);
  
  // Update springs based on mouse position
  useEffect(() => {
    if (isHovered) {
      rotateX.set(-mouseY.get() * 7);  // Invert Y for natural feeling
      rotateY.set(mouseX.get() * 7);
      z.set(depth);
    } else {
      rotateX.set(0);
      rotateY.set(0);
      z.set(0);
    }
  }, [isHovered, mouseX, mouseY, rotateX, rotateY, z, depth]);
  
  // Transform spring values to CSS
  const transform = useTransform(
    [rotateX, rotateY, z],
    ([rx, ry, z]) => `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${z}px)`
  );
  
  // Shadow based on rotation
  const shadow = useTransform(
    [rotateX, rotateY],
    ([rx, ry]) => {
      const shadowX = -ry * 5;
      const shadowY = rx * 5;
      return `${shadowX}px ${shadowY}px 20px rgba(13, 240, 255, 0.2),
              ${-shadowX}px ${-shadowY}px 20px rgba(157, 0, 255, 0.1)`;
    }
  );

  return (
    <motion.div
      ref={cardRef}
      className={`depth-card ${className}`}
      style={{ 
        transform,
        boxShadow: shadow,
        willChange: 'transform, box-shadow'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxCard;
