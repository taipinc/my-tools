import React from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import useSimulatorStore from '../../stores/simulatorStore';

const BinaryDisplay = ({ x, y, id, inputs = [false, false, false, false, false, false, false, false], output = false }) => {
  const { updateComponentPosition, finishWireDrawing, startWireDrawing, isDrawingWire, removeComponent, selectedComponents, moveSelectedComponents, stagePosition, stageScale } = useSimulatorStore();
  const [lastPos, setLastPos] = React.useState({ x, y });
  const isSelected = selectedComponents.includes(id);

  const handleDragMove = (e) => {
    const newX = e.target.x();
    const newY = e.target.y();

    if (isSelected && selectedComponents.length > 1) {
      const deltaX = newX - lastPos.x;
      const deltaY = newY - lastPos.y;
      moveSelectedComponents(deltaX, deltaY);
      setLastPos({ x: newX, y: newY });
    } else {
      updateComponentPosition(id, newX, newY);
      setLastPos({ x: newX, y: newY });
    }
  };

  const handleDragStart = (e) => {
    setLastPos({ x: e.target.x(), y: e.target.y() });
  };

  const handleDragEnd = (e) => {
    // Final position update is already done in handleDragMove
  };

  const handleDeleteClick = (e) => {
    e.cancelBubble = true;
    removeComponent(id);
  };

  const handlePinClick = (pinIndex, pinType, e) => {
    e.cancelBubble = true;

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    // Account for stage position offset and scale
    const adjustedX = (pointerPos.x - stagePosition.x) / stageScale;
    const adjustedY = (pointerPos.y - stagePosition.y) / stageScale;

    if (isDrawingWire) {
      if (pinType === 'input') {
        finishWireDrawing(id, pinIndex, pinType, adjustedX, adjustedY);
      }
    } else {
      if (pinType === 'output') {
        startWireDrawing(id, pinIndex, pinType, adjustedX, adjustedY);
      }
    }
  };

  // Calculate decimal value from binary inputs
  const calculateDecimal = () => {
    let decimal = 0;
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i]) {
        decimal += Math.pow(2, i);
      }
    }
    return decimal;
  };

  const decimalValue = calculateDecimal();

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      {/* Selection highlight */}
      {isSelected && (
        <Rect
          x={-10}
          y={-10}
          width={125}
          height={220}
          fill="rgba(255, 107, 53, 0.2)"
          stroke="#ff6b35"
          strokeWidth={2}
          dash={[5, 5]}
          cornerRadius={5}
        />
      )}

      {/* Main body */}
      <Rect
        x={0}
        y={0}
        width={100}
        height={200}
        fill="white"
        stroke={isSelected ? "#ff6b35" : "black"}
        strokeWidth={isSelected ? 3 : 2}
        cornerRadius={5}
      />
      
      {/* Title */}
      <Text
        x={10}
        y={8}
        text="BIN→DEC"
        fontSize={10}
        fontFamily="Arial"
        fill="black"
        fontStyle="bold"
        align="left"
        width={100}
      />
          
      {/* Decimal display */}
      <Rect
        x={10}
        y={20}
        width={80}
        height={50}
        fill="#222"
        stroke="black"
        strokeWidth={1}
        cornerRadius={3}
      />

      <Text
        x={10}
        y={29}
        text={decimalValue.toString()}
        fontSize={32}
        fontFamily="Arial"
        fill="#00ff41"
        align="center"
        width={80}
        fontStyle="bold"
      />
      
      {[...Array(8)].map((_, i) => (
        <Circle
          key={i}
          x={0}
          y={75 + (i * 15)}
          radius={5}
          fill={inputs[i] ? '#4CAF50' : '#666'}
          stroke="black"
          strokeWidth={1}
          onClick={(e) => handlePinClick(i, 'input', e)}
        />
      ))}
      
      {/* Output pin */}
      <Circle
        x={105}
        y={40}
        radius={5}
        fill={decimalValue > 0 ? '#4CAF50' : '#666'}
        stroke="black"
        strokeWidth={1}
        onClick={(e) => handlePinClick(0, 'output', e)}
      />

      {/* Delete button */}
      <Circle
        x={2}
        y={2}
        radius={8}
        fill="#ff4444"
        stroke="#cc0000"
        strokeWidth={1}
        onClick={handleDeleteClick}
        onMouseEnter={(e) => {
          e.target.getStage().container().style.cursor = 'pointer';
        }}
        onMouseLeave={(e) => {
          e.target.getStage().container().style.cursor = 'default';
        }}
      />
      <Text
        x={-1}
        y={-3}
        text="×"
        fontSize={12}
        fill="white"
        fontStyle="bold"
        onClick={handleDeleteClick}
      />
    </Group>
  );
};

export default BinaryDisplay;