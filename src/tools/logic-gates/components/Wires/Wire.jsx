import React from 'react';
import { Shape } from 'react-konva';
import useSimulatorStore from '../../stores/simulatorStore';

const Wire = ({ id, startX, startY, endX, endY, isActive = false }) => {
  const { removeWire } = useSimulatorStore();

  const handleClick = (e) => {
    e.cancelBubble = true;
    removeWire(id);
  };

  return (
    <Shape
      sceneFunc={(context, shape) => {
        context.beginPath();
        
        // Calculate control points for smooth bezier curve
        const dx = endX - startX;
        const controlOffset = Math.max(Math.abs(dx) * 0.6, 50);
        
        const cp1x = startX + controlOffset;
        const cp1y = startY;
        const cp2x = endX - controlOffset;
        const cp2y = endY;
        
        // Create bezier curve
        context.moveTo(startX, startY);
        context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        
        // Style the line
        context.lineWidth = 4; // Thicker for easier clicking
        context.strokeStyle = isActive ? '#4CAF50' : '#666';
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        // Add glow effect for active wires
        if (isActive) {
          context.shadowBlur = 4;
          context.shadowColor = '#4CAF50';
        }
        
        context.stroke();
        context.fillStrokeShape(shape);
      }}
      stroke={isActive ? '#4CAF50' : '#666'}
      strokeWidth={4}
      onClick={handleClick}
    />
  );
};

export default Wire;