import React from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import useSimulatorStore from '../../stores/simulatorStore';

const InputSwitch = ({ x, y, id, output = false }) => {
  const { updateComponentPosition, updateInputValue, startWireDrawing, isDrawingWire, removeComponent, selectedComponents, moveSelectedComponents, stagePosition, stageScale } = useSimulatorStore();
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

  const handleClick = () => {
    updateInputValue(id, !output);
  };

  const handlePinClick = (pinIndex, pinType, e) => {
    e.cancelBubble = true;

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    // Account for stage position offset and scale
    const adjustedX = (pointerPos.x - stagePosition.x) / stageScale;
    const adjustedY = (pointerPos.y - stagePosition.y) / stageScale;

    if (!isDrawingWire && pinType === 'output') {
      startWireDrawing(id, pinIndex, pinType, adjustedX, adjustedY);
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
          y={-10}
          width={95}
          height={70}
          fill="rgba(255, 107, 53, 0.2)"
          stroke="#ff6b35"
          strokeWidth={2}
          dash={[5, 5]}
          cornerRadius={5}
        />
      )}

      {/* Switch body */}
      <Rect
        x={0}
        y={0}
        width={70}
        height={50}
        fill={output ? '#4CAF50' : '#f44336'}
        stroke={isSelected ? "#ff6b35" : "black"}
        strokeWidth={isSelected ? 3 : 2}
        cornerRadius={5}
        onClick={handleClick}
      />

      {/* Switch label */}
      <Text
        x={15}
        y={20}
        text={output ? 'ON' : 'OFF'}
        fontSize={14}
        fontFamily="Arial"
        fill="white"
        fontStyle="bold"
        onClick={handleClick}
      />

      {/* Output pin */}
      <Circle
        x={75}
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

export default InputSwitch;