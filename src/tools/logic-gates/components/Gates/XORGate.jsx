import React from 'react';
import { Group, Path, Circle, Text, Rect } from 'react-konva';
import useSimulatorStore from '../../stores/simulatorStore';

const XORGate = ({ x, y, id, inputs = [false, false], output = false }) => {
  const { updateComponentPosition, startWireDrawing, finishWireDrawing, isDrawingWire, removeComponent, selectedComponents, moveSelectedComponents, stagePosition, stageScale } = useSimulatorStore();
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
          y={-5}
          width={90}
          height={60}
          fill="rgba(255, 107, 53, 0.2)"
          stroke="#ff6b35"
          strokeWidth={2}
          dash={[5, 5]}
          cornerRadius={5}
        />
      )}

      {/* Extra input line (XOR distinguishing feature) - open curve */}
      <Path
        data="M 7 7 Q 14 25 7 43"
        fill="none"
        stroke={isSelected ? "#ff6b35" : "black"}
        strokeWidth={isSelected ? 3 : 2}
        listening={false}
        lineCap="round"
      />

      {/* XOR Gate Symbol - same as OR but with double input line */}
      <Path
        data="M 10 5 Q 20 25 10 45 Q 35 45 55 25 Q 35 5 10 5 Z"
        fill="white"
        stroke={isSelected ? "#ff6b35" : "black"}
        strokeWidth={isSelected ? 3 : 2}
      />

      {/* Gate label */}
      <Text
        x={20}
        y={18}
        text="XOR"
        fontSize={12}
        fontFamily="Arial"
        fill="black"
        fontStyle="bold"
        listening={false}
      />

      {/* Input pins */}
      <Circle
        x={0}
        y={15}
        radius={5}
        fill={inputs[0] ? '#4CAF50' : '#666'}
        stroke="black"
        strokeWidth={2}
        onClick={(e) => handlePinClick(0, 'input', e)}
      />
      <Circle
        x={0}
        y={35}
        radius={5}
        fill={inputs[1] ? '#4CAF50' : '#666'}
        stroke="black"
        strokeWidth={2}
        onClick={(e) => handlePinClick(1, 'input', e)}
      />

      {/* Output pin */}
      <Circle
        x={60}
        y={25}
        radius={5}
        fill={output ? '#4CAF50' : '#666'}
        stroke="black"
        strokeWidth={2}
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

export default XORGate;