import React from 'react';
import { Group, Path, Circle, Text, Rect } from 'react-konva';
import useSimulatorStore from '../../stores/simulatorStore';

const ANDGate = ({ x, y, id, inputs = [false, false], output = false }) => {
  const { updateComponentPosition, startWireDrawing, finishWireDrawing, isDrawingWire, selectedComponents, removeComponent, moveSelectedComponents, stagePosition, stageScale } = useSimulatorStore();
  const [lastPos, setLastPos] = React.useState({ x, y });

  const isSelected = selectedComponents.includes(id);

  const handleDragMove = (e) => {
    const newX = e.target.x();
    const newY = e.target.y();

    if (isSelected && selectedComponents.length > 1) {
      // Move all selected components together
      const deltaX = newX - lastPos.x;
      const deltaY = newY - lastPos.y;
      moveSelectedComponents(deltaX, deltaY);
      setLastPos({ x: newX, y: newY });
    } else {
      // Move only this component
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
          width={100}
          height={60}
          fill="rgba(255, 107, 53, 0.2)"
          stroke="#ff6b35"
          strokeWidth={2}
          dash={[5, 5]}
          cornerRadius={5}
        />
      )}

      {/* AND Gate Symbol - D-shaped with flat left side and rounded right */}
      <Path
        data="M 5 5 L 40 5 Q 65 5 65 25 Q 65 45 40 45 L 5 45 Z"
        fill="white"
        stroke={isSelected ? "#ff6b35" : "black"}
        strokeWidth={isSelected ? 3 : 2}
      />

      {/* Gate label */}
      <Text
        x={18}
        y={18}
        text="AND"
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
        x={70}
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

export default ANDGate;