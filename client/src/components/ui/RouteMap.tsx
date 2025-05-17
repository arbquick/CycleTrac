import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GPSPoint } from '@shared/schema';

interface RouteMapProps {
  routePoints: GPSPoint[];
}

const RouteMap: React.FC<RouteMapProps> = ({ routePoints }) => {
  const mapRef = useRef<SVGSVGElement>(null);
  
  // Generate SVG path from route points
  const generatePathFromPoints = (): string => {
    if (routePoints.length === 0) {
      // Default demo path if no points
      return "M50,250 C100,240 120,150 170,140 S250,190 300,180 S380,120 450,100";
    }
    
    // Normalize points to fit within the SVG viewBox
    const svgWidth = 500;
    const svgHeight = 300;
    
    // Find min/max coordinates to normalize
    let minLat = Math.min(...routePoints.map(p => p.lat));
    let maxLat = Math.max(...routePoints.map(p => p.lat));
    let minLng = Math.min(...routePoints.map(p => p.lng));
    let maxLng = Math.max(...routePoints.map(p => p.lng));
    
    // If we don't have enough variation, add some padding
    if (maxLat - minLat < 0.001) {
      const pad = 0.001;
      minLat -= pad;
      maxLat += pad;
    }
    
    if (maxLng - minLng < 0.001) {
      const pad = 0.001;
      minLng -= pad;
      maxLng += pad;
    }
    
    // Convert points to SVG coordinate space
    const normalizedPoints = routePoints.map(point => {
      const x = ((point.lng - minLng) / (maxLng - minLng)) * svgWidth;
      // Flip Y axis since SVG Y increases downward
      const y = svgHeight - ((point.lat - minLat) / (maxLat - minLat)) * svgHeight;
      return { x, y };
    });
    
    // Generate SVG path
    let path = `M${normalizedPoints[0].x},${normalizedPoints[0].y}`;
    
    for (let i = 1; i < normalizedPoints.length; i++) {
      path += ` L${normalizedPoints[i].x},${normalizedPoints[i].y}`;
    }
    
    return path;
  };
  
  const routePath = generatePathFromPoints();
  
  // Find the last point to show the current position
  const getCurrentPosition = () => {
    if (routePoints.length === 0) {
      // Default position if no points
      return { x: 300, y: 180 };
    }
    
    const svgWidth = 500;
    const svgHeight = 300;
    
    let minLat = Math.min(...routePoints.map(p => p.lat));
    let maxLat = Math.max(...routePoints.map(p => p.lat));
    let minLng = Math.min(...routePoints.map(p => p.lng));
    let maxLng = Math.max(...routePoints.map(p => p.lng));
    
    // If we don't have enough variation, add some padding
    if (maxLat - minLat < 0.001) {
      const pad = 0.001;
      minLat -= pad;
      maxLat += pad;
    }
    
    if (maxLng - minLng < 0.001) {
      const pad = 0.001;
      minLng -= pad;
      maxLng += pad;
    }
    
    const lastPoint = routePoints[routePoints.length - 1];
    const x = ((lastPoint.lng - minLng) / (maxLng - minLng)) * svgWidth;
    const y = svgHeight - ((lastPoint.lat - minLat) / (maxLat - minLat)) * svgHeight;
    
    return { x, y };
  };
  
  const currentPosition = getCurrentPosition();

  return (
    <div className="w-full h-full relative bg-dark-bg/30 backdrop-blur-sm">
      <svg width="100%" height="100%" viewBox="0 0 500 300" className="w-full h-full">
        {/* Grid lines */}
        <g className="chart-grid">
          <line x1="0" y1="0" x2="500" y2="0" />
          <line x1="0" y1="50" x2="500" y2="50" />
          <line x1="0" y1="100" x2="500" y2="100" />
          <line x1="0" y1="150" x2="500" y2="150" />
          <line x1="0" y1="200" x2="500" y2="200" />
          <line x1="0" y1="250" x2="500" y2="250" />
          <line x1="0" y1="300" x2="500" y2="300" />
          
          <line x1="0" y1="0" x2="0" y2="300" />
          <line x1="100" y1="0" x2="100" y2="300" />
          <line x1="200" y1="0" x2="200" y2="300" />
          <line x1="300" y1="0" x2="300" y2="300" />
          <line x1="400" y1="0" x2="400" y2="300" />
          <line x1="500" y1="0" x2="500" y2="300" />
        </g>
        
        {/* Route path */}
        <motion.path 
          d={routePath} 
          fill="none" 
          stroke="#0DF0FF" 
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
        />
        
        {/* Glow effect */}
        <path 
          d={routePath}
          fill="none" 
          stroke="#0DF0FF" 
          strokeWidth="8"
          strokeLinecap="round"
          filter="blur(8px)"
          opacity="0.4"
        />
        
        {/* Current position */}
        <motion.circle 
          cx={currentPosition.x} 
          cy={currentPosition.y} 
          r="5" 
          fill="#FF00FF" 
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5 }}
        />
        <motion.circle 
          cx={currentPosition.x} 
          cy={currentPosition.y} 
          r="8" 
          fill="none" 
          stroke="#FF00FF" 
          strokeWidth="2" 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        />
        <motion.circle 
          cx={currentPosition.x} 
          cy={currentPosition.y} 
          r="12" 
          fill="none" 
          stroke="#FF00FF" 
          strokeWidth="2"
          opacity="0.5"
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            repeatType: "loop" 
          }}
        />
      </svg>
    </div>
  );
};

export default RouteMap;
