import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Group, Rect, Text } from "react-konva";
import ANDGate from "./components/Gates/ANDGate";
import ORGate from "./components/Gates/ORGate";
import NOTGate from "./components/Gates/NOTGate";
import XORGate from "./components/Gates/XORGate";
import InputSwitch from "./components/IO/InputSwitch";
import OutputIndicator from "./components/IO/OutputIndicator";
import Wire from "./components/Wires/Wire";
import Toolbar from "./components/UI/Toolbar";
import HelpPanel from "./components/UI/HelpPanel";
import SaveLoadPanel from "./components/UI/SaveLoadPanel";
import useSimulatorStore from "./stores/simulatorStore";
import BinaryDisplay from "./components/IO/BinaryDisplay";
import "./App.css";

function App() {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const {
    components,
    wires,
    tempWire,
    addComponent,
    updateTempWire,
    cancelWireDrawing,
    isDrawingWire,
    selectedComponents,
    isSelecting,
    selectionBox,
    startSelection,
    updateSelection,
    finishSelection,
    cancelSelection,
    removeSelectedComponents,
    clearAll,
    isPanning,
    stagePosition,
    startPanning,
    updatePanning,
    finishPanning,
    selectAllComponents,
    moveSelectedComponents,
    duplicateSelectedComponents,
    calculateLogic,
    stageScale,
    setZoom,
  } = useSimulatorStore();

  const didInitialFit = useRef(false);

  useEffect(() => {
    calculateLogic();

    // Fit default layout to viewport on initial load only (after container has real size)
    if (components.length > 0 && !didInitialFit.current && dimensions.width > 100 && dimensions.height > 100) {
      didInitialFit.current = true;
      const padding = 60;
      const defaultSize = { w: 80, h: 55 };
      const sizeMap = { BINARY_DISPLAY: { w: 110, h: 210 } };

      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      components.forEach((c) => {
        const size = sizeMap[c.type] || defaultSize;
        minX = Math.min(minX, c.x);
        maxX = Math.max(maxX, c.x + size.w);
        minY = Math.min(minY, c.y);
        maxY = Math.max(maxY, c.y + size.h);
      });

      const bboxW = maxX - minX;
      const bboxH = maxY - minY;
      const scale = Math.min(
        (dimensions.width - padding * 2) / bboxW,
        (dimensions.height - padding * 2) / bboxH,
        1,
      );
      const offsetX = (dimensions.width - bboxW * scale) / 2 - minX * scale;
      const offsetY = (dimensions.height - bboxH * scale) / 2 - minY * scale;
      setZoom(scale, offsetX, offsetY);
    }
  }, [dimensions.width, dimensions.height]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({
        width: Math.max(1, Math.floor(rect.width)),
        height: Math.max(1, Math.floor(rect.height)),
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space key for panning
      if (e.key === " " && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
      }

      // Delete components
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedComponents.length > 0) {
          e.preventDefault();
          removeSelectedComponents();
        }
      }

      // Escape to cancel
      if (e.key === "Escape") {
        cancelWireDrawing();
        cancelSelection();
      }

      // Ctrl+A to select all
      if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        selectAllComponents();
      }

      // Arrow keys to move selected components
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (selectedComponents.length > 0) {
          e.preventDefault();
          const delta = e.shiftKey ? 10 : 1;
          const deltaX =
            e.key === "ArrowLeft" ? -delta : e.key === "ArrowRight" ? delta : 0;
          const deltaY =
            e.key === "ArrowUp" ? -delta : e.key === "ArrowDown" ? delta : 0;
          moveSelectedComponents(deltaX, deltaY);
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === " ") {
        setIsSpacePressed(false);
        if (isPanning) {
          finishPanning();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    selectedComponents,
    removeSelectedComponents,
    cancelWireDrawing,
    cancelSelection,
    selectAllComponents,
    moveSelectedComponents,
    isSpacePressed,
    isPanning,
    finishPanning,
  ]);

  const ZOOM_FACTOR = 1.2;
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 5;

  const handleZoomIn = () => {
    const newScale = Math.min(stageScale * ZOOM_FACTOR, MAX_ZOOM);
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    setZoom(
      newScale,
      cx - (cx - stagePosition.x) * (newScale / stageScale),
      cy - (cy - stagePosition.y) * (newScale / stageScale),
    );
  };

  const handleZoomOut = () => {
    const newScale = Math.max(stageScale / ZOOM_FACTOR, MIN_ZOOM);
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    setZoom(
      newScale,
      cx - (cx - stagePosition.x) * (newScale / stageScale),
      cy - (cy - stagePosition.y) * (newScale / stageScale),
    );
  };

  const handleStageMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();

    // Start panning if space is pressed or middle mouse button
    if (isSpacePressed || e.evt.button === 1) {
      e.evt.preventDefault();
      startPanning(pos.x, pos.y);
      return;
    }

    // Don't start selection if clicking on a component or if drawing wire
    if (e.target !== e.target.getStage() || isDrawingWire) return;

    // Account for stage position offset and scale
    const adjustedX = (pos.x - stagePosition.x) / stageScale;
    const adjustedY = (pos.y - stagePosition.y) / stageScale;
    startSelection(adjustedX, adjustedY);
  };

  const handleStageMouseMove = (e) => {
    const pos = e.target.getStage().getPointerPosition();

    if (isPanning) {
      updatePanning(pos.x, pos.y);
    } else if (isDrawingWire) {
      // Account for stage position offset and scale
      const adjustedX = (pos.x - stagePosition.x) / stageScale;
      const adjustedY = (pos.y - stagePosition.y) / stageScale;
      updateTempWire(adjustedX, adjustedY);
    } else if (isSelecting) {
      // Account for stage position offset and scale
      const adjustedX = (pos.x - stagePosition.x) / stageScale;
      const adjustedY = (pos.y - stagePosition.y) / stageScale;
      updateSelection(adjustedX, adjustedY);
    }
  };

  const handleStageMouseUp = (e) => {
    if (isPanning) {
      finishPanning();
    } else if (isSelecting) {
      finishSelection();
    }
  };

  const handleStageClick = (e) => {
    if (isDrawingWire && e.target === e.target.getStage()) {
      cancelWireDrawing();
    } else if (!isSelecting && e.target === e.target.getStage()) {
      // Clear selection when clicking empty space
      cancelSelection();
    }
  };

  const renderComponent = (component) => {
    const commonProps = {
      key: component.id,
      id: component.id,
      x: component.x,
      y: component.y,
      inputs: component.inputs,
      output: component.output,
    };

    switch (component.type) {
      case "AND":
        return <ANDGate {...commonProps} />;
      case "OR":
        return <ORGate {...commonProps} />;
      case "NOT":
        return <NOTGate {...commonProps} />;
      case "XOR":
        return <XORGate {...commonProps} />;
      case "INPUT":
        return <InputSwitch {...commonProps} />;
      case "OUTPUT":
        return <OutputIndicator {...commonProps} />;
      case "BINARY_DISPLAY":
        return <BinaryDisplay {...commonProps} />;
      default:
        return null;
    }
  };

  const renderSelectionBox = () => {
    if (!selectionBox) return null;

    const { startX, startY, endX, endY } = selectionBox;
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    return (
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="#007acc"
        strokeWidth={1}
        dash={[5, 5]}
        fill="rgba(0, 122, 204, 0.1)"
      />
    );
  };

  return (
    <div className="App" ref={containerRef}>
      <Toolbar onAddComponent={addComponent} onClear={clearAll} />
      <HelpPanel />
      <SaveLoadPanel />
      <div className="zoom-controls">
        <button className="zoom-btn" onClick={handleZoomIn}>
          +
        </button>
        <button className="zoom-btn" onClick={handleZoomOut}>
          −
        </button>
      </div>
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          backgroundColor: "#f5f5f5",
          cursor: isDrawingWire
            ? "crosshair"
            : isPanning || isSpacePressed
              ? "grab"
              : "default",
        }}
        x={stagePosition.x}
        y={stagePosition.y}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
      >
        <Layer>
          <Group scaleX={stageScale} scaleY={stageScale}>
            {/* Render permanent wires */}
            {wires.map((wire) => (
              <Wire key={wire.id} {...wire} />
            ))}

            {/* Render temporary wire while drawing */}
            {tempWire && <Wire {...tempWire} isActive={false} />}

            {/* Render components */}
            {components.map(renderComponent)}

            {/* Render selection box */}
            {renderSelectionBox()}
          </Group>

          {/* Wire drawing feedback — fixed to viewport */}
          {isDrawingWire && (
            <>
              <Rect
                x={10 - stagePosition.x}
                y={dimensions.height - 50 - stagePosition.y}
                width={250}
                height={30}
                fill="#007acc"
                opacity={0.9}
                cornerRadius={5}
              />
              <Text
                x={20 - stagePosition.x}
                y={dimensions.height - 40 - stagePosition.y}
                text="Drawing wire... Click input pin or ESC to cancel"
                fontSize={12}
                fill="white"
                fontFamily="Arial"
              />
            </>
          )}

          {/* Duplicate button for selected components */}
          {selectedComponents.length > 0 && (
            <>
              <Rect
                x={10 - stagePosition.x}
                y={dimensions.height - 100 - stagePosition.y}
                width={180}
                height={35}
                fill="#4CAF50"
                opacity={0.95}
                cornerRadius={5}
                onClick={duplicateSelectedComponents}
                onMouseEnter={(e) => {
                  e.target.getStage().container().style.cursor = "pointer";
                }}
                onMouseLeave={(e) => {
                  e.target.getStage().container().style.cursor = "default";
                }}
              />
              <Text
                x={20 - stagePosition.x}
                y={dimensions.height - 88 - stagePosition.y}
                text={`Duplicate ${selectedComponents.length} component${selectedComponents.length > 1 ? "s" : ""}`}
                fontSize={13}
                fill="white"
                fontFamily="Arial"
                fontStyle="bold"
                onClick={duplicateSelectedComponents}
              />
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
