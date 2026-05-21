import { create } from 'zustand';

const useSimulatorStore = create((set, get) => ({
  components: [
    { id: 5, type: 'BINARY_DISPLAY', x: 150, y: 800, inputs: [false, false, false, false, false, false, false, false], output: false },
    { id: 6, type: 'BINARY_DISPLAY', x: 333, y: 800, inputs: [false, false, false, false, false, false, false, false], output: false },
    { id: 7, type: 'BINARY_DISPLAY', x: 1126, y: 250, inputs: [false, false, false, false, false, false, false, false], output: false },
    { id: 8, type: 'OUTPUT', x: 875, y: 60, inputs: [false], output: false },
    { id: 9, type: 'OUTPUT', x: 875, y: 240, inputs: [false], output: false },
    { id: 10, type: 'OUTPUT', x: 875, y: 440, inputs: [false], output: false },
    { id: 11, type: 'OUTPUT', x: 875, y: 680, inputs: [false], output: false },
    { id: 12, type: 'INPUT', x: 200, y: 620, inputs: [], output: false },
    { id: 13, type: 'INPUT', x: 200, y: 420, inputs: [], output: false },
    { id: 14, type: 'INPUT', x: 200, y: 220, inputs: [], output: false },
    { id: 15, type: 'INPUT', x: 200, y: 20, inputs: [], output: false },
    { id: 16, type: 'INPUT', x: 28, y: 680, inputs: [], output: false },
    { id: 17, type: 'INPUT', x: 28, y: 480, inputs: [], output: false },
    { id: 18, type: 'INPUT', x: 28, y: 280, inputs: [], output: false },
    { id: 19, type: 'INPUT', x: 28, y: 80, inputs: [], output: false },
    { id: 20, type: 'XOR', x: 540, y: 64, inputs: [false, false], output: false },
    { id: 21, type: 'AND', x: 540, y: 128, inputs: [false, false], output: false },
    { id: 22, type: 'XOR', x: 400, y: 264, inputs: [false, false], output: false },
    { id: 23, type: 'XOR', x: 540, y: 233, inputs: [false, false], output: false },
    { id: 24, type: 'AND', x: 540, y: 371, inputs: [false, false], output: false },
    { id: 25, type: 'AND', x: 540, y: 314, inputs: [false, false], output: false },
    { id: 26, type: 'OR', x: 650, y: 343, inputs: [false, false], output: false },
    { id: 27, type: 'XOR', x: 400, y: 500, inputs: [false, false], output: false },
    { id: 28, type: 'XOR', x: 540, y: 469, inputs: [false, false], output: false },
    { id: 29, type: 'AND', x: 540, y: 607, inputs: [false, false], output: false },
    { id: 30, type: 'AND', x: 540, y: 550, inputs: [false, false], output: false },
    { id: 31, type: 'OR', x: 650, y: 579, inputs: [false, false], output: false },
    { id: 32, type: 'XOR', x: 400, y: 718, inputs: [false, false], output: false },
    { id: 33, type: 'XOR', x: 540, y: 687, inputs: [false, false], output: false },
    { id: 34, type: 'AND', x: 540, y: 825, inputs: [false, false], output: false },
    { id: 35, type: 'AND', x: 540, y: 768, inputs: [false, false], output: false },
    { id: 36, type: 'OR', x: 650, y: 797, inputs: [false, false], output: false },
    { id: 37, type: 'OUTPUT', x: 875, y: 824, inputs: [false], output: false }
  ],

  connections: [
    { id: 1, fromComponent: 8, fromPin: 0, toComponent: 7, toPin: 0 },
    { id: 2, fromComponent: 9, fromPin: 0, toComponent: 7, toPin: 1 },
    { id: 3, fromComponent: 10, fromPin: 0, toComponent: 7, toPin: 2 },
    { id: 4, fromComponent: 11, fromPin: 0, toComponent: 7, toPin: 3 },
    { id: 5, fromComponent: 15, fromPin: 0, toComponent: 20, toPin: 0 },
    { id: 6, fromComponent: 19, fromPin: 0, toComponent: 20, toPin: 1 },
    { id: 7, fromComponent: 20, fromPin: 0, toComponent: 8, toPin: 0 },
    { id: 8, fromComponent: 15, fromPin: 0, toComponent: 21, toPin: 0 },
    { id: 9, fromComponent: 19, fromPin: 0, toComponent: 21, toPin: 1 },
    { id: 10, fromComponent: 19, fromPin: 0, toComponent: 5, toPin: 0 },
    { id: 11, fromComponent: 18, fromPin: 0, toComponent: 5, toPin: 1 },
    { id: 12, fromComponent: 17, fromPin: 0, toComponent: 5, toPin: 2 },
    { id: 13, fromComponent: 16, fromPin: 0, toComponent: 5, toPin: 3 },
    { id: 14, fromComponent: 15, fromPin: 0, toComponent: 6, toPin: 0 },
    { id: 15, fromComponent: 14, fromPin: 0, toComponent: 6, toPin: 1 },
    { id: 16, fromComponent: 13, fromPin: 0, toComponent: 6, toPin: 2 },
    { id: 17, fromComponent: 12, fromPin: 0, toComponent: 6, toPin: 3 },
    { id: 18, fromComponent: 14, fromPin: 0, toComponent: 22, toPin: 0 },
    { id: 19, fromComponent: 18, fromPin: 0, toComponent: 22, toPin: 1 },
    { id: 20, fromComponent: 21, fromPin: 0, toComponent: 23, toPin: 0 },
    { id: 21, fromComponent: 22, fromPin: 0, toComponent: 23, toPin: 1 },
    { id: 22, fromComponent: 23, fromPin: 0, toComponent: 9, toPin: 0 },
    { id: 23, fromComponent: 14, fromPin: 0, toComponent: 24, toPin: 0 },
    { id: 24, fromComponent: 18, fromPin: 0, toComponent: 24, toPin: 1 },
    { id: 25, fromComponent: 21, fromPin: 0, toComponent: 25, toPin: 0 },
    { id: 26, fromComponent: 22, fromPin: 0, toComponent: 25, toPin: 1 },
    { id: 27, fromComponent: 25, fromPin: 0, toComponent: 26, toPin: 0 },
    { id: 28, fromComponent: 24, fromPin: 0, toComponent: 26, toPin: 1 },
    { id: 30, fromComponent: 27, fromPin: 0, toComponent: 28, toPin: 1 },
    { id: 31, fromComponent: 27, fromPin: 0, toComponent: 30, toPin: 1 },
    { id: 32, fromComponent: 30, fromPin: 0, toComponent: 31, toPin: 0 },
    { id: 33, fromComponent: 29, fromPin: 0, toComponent: 31, toPin: 1 },
    { id: 35, fromComponent: 13, fromPin: 0, toComponent: 27, toPin: 0 },
    { id: 36, fromComponent: 17, fromPin: 0, toComponent: 27, toPin: 1 },
    { id: 37, fromComponent: 26, fromPin: 0, toComponent: 28, toPin: 0 },
    { id: 38, fromComponent: 28, fromPin: 0, toComponent: 10, toPin: 0 },
    { id: 39, fromComponent: 13, fromPin: 0, toComponent: 29, toPin: 0 },
    { id: 40, fromComponent: 17, fromPin: 0, toComponent: 29, toPin: 1 },
    { id: 41, fromComponent: 26, fromPin: 0, toComponent: 30, toPin: 0 },
    { id: 43, fromComponent: 32, fromPin: 0, toComponent: 33, toPin: 1 },
    { id: 44, fromComponent: 32, fromPin: 0, toComponent: 35, toPin: 1 },
    { id: 45, fromComponent: 35, fromPin: 0, toComponent: 36, toPin: 0 },
    { id: 46, fromComponent: 34, fromPin: 0, toComponent: 36, toPin: 1 },
    { id: 47, fromComponent: 12, fromPin: 0, toComponent: 32, toPin: 0 },
    { id: 48, fromComponent: 16, fromPin: 0, toComponent: 32, toPin: 1 },
    { id: 49, fromComponent: 12, fromPin: 0, toComponent: 34, toPin: 0 },
    { id: 50, fromComponent: 16, fromPin: 0, toComponent: 34, toPin: 1 },
    { id: 51, fromComponent: 31, fromPin: 0, toComponent: 33, toPin: 0 },
    { id: 52, fromComponent: 33, fromPin: 0, toComponent: 11, toPin: 0 },
    { id: 53, fromComponent: 31, fromPin: 0, toComponent: 35, toPin: 0 },
    { id: 54, fromComponent: 36, fromPin: 0, toComponent: 37, toPin: 0 },
    { id: 55, fromComponent: 37, fromPin: 0, toComponent: 7, toPin: 4 }
  ],
  wires: [],

  nextId: 38,
  nextConnectionId: 56,
  nextComponentOffset: 0,

  // Wire drawing state
  isDrawingWire: false,
  wireStart: null,
  tempWire: null,

  // Selection state
  selectedComponents: [],
  isSelecting: false,
  selectionBox: null,

  // Pan state
  isPanning: false,
  panStart: null,
  stagePosition: { x: 0, y: 0 },
  stageScale: 1,

  // Actions
  addComponent: (type) => {
    let inputs = [];
    switch (type) {
      case 'NOT':
      case 'OUTPUT':
        inputs = [false];
        break;
      case 'INPUT':
        inputs = [];
        break;
      case 'BINARY_DISPLAY':
        inputs = [false, false, false, false, false, false, false, false]; // 8 bits
        break;
      default: // AND, OR, XOR
        inputs = [false, false];
        break;
    }

    const offset = get().nextComponentOffset;
    const newComponent = {
      id: get().nextId,
      type,
      x: window.innerWidth / 2 - 40 + (offset * 20),
      y: window.innerHeight / 2 - 25 + (offset * 20),
      inputs,
      output: false
    };

    set(state => ({
      components: [...state.components, newComponent],
      nextId: state.nextId + 1,
      nextComponentOffset: (state.nextComponentOffset + 1) % 10
    }));
  },

  updateComponentPosition: (componentId, x, y) => {
    set(state => ({
      components: state.components.map(comp =>
        comp.id === componentId ? { ...comp, x, y } : comp
      )
    }));
    // Recalculate wire positions after moving
    get().calculateLogic();
  },

  startWireDrawing: (componentId, pinIndex, pinType, x, y) => {
    set({
      isDrawingWire: true,
      wireStart: { componentId, pinIndex, pinType, x, y }
    });
  },

  updateTempWire: (endX, endY) => {
    const { wireStart } = get();
    if (wireStart) {
      set({
        tempWire: {
          startX: wireStart.x,
          startY: wireStart.y,
          endX,
          endY
        }
      });
    }
  },

  finishWireDrawing: (endComponentId, endPinIndex, endPinType, endX, endY) => {
    const { wireStart, connections, nextConnectionId } = get();
    
    if (!wireStart) return;

    // Validate connection (output to input only)
    if (wireStart.pinType === 'output' && endPinType === 'input') {
      // Check if connection already exists
      const existingConnection = connections.find(conn => 
        conn.toComponent === endComponentId && conn.toPin === endPinIndex
      );

      if (!existingConnection) {
        const newConnection = {
          id: nextConnectionId,
          fromComponent: wireStart.componentId,
          fromPin: wireStart.pinIndex,
          toComponent: endComponentId,
          toPin: endPinIndex
        };

        set(state => ({
          connections: [...state.connections, newConnection],
          nextConnectionId: state.nextConnectionId + 1,
          isDrawingWire: false,
          wireStart: null,
          tempWire: null
        }));

        // Recalculate logic
        get().calculateLogic();
      } else {
        get().cancelWireDrawing();
      }
    } else {
      get().cancelWireDrawing();
    }
  },

  cancelWireDrawing: () => {
    set({
      isDrawingWire: false,
      wireStart: null,
      tempWire: null
    });
  },

  // Selection actions
  startSelection: (x, y) => {
    set({
      isSelecting: true,
      selectionBox: { startX: x, startY: y, endX: x, endY: y }
    });
  },

  updateSelection: (x, y) => {
    set(state => ({
      selectionBox: state.selectionBox ? {
        ...state.selectionBox,
        endX: x,
        endY: y
      } : null
    }));
  },

  finishSelection: () => {
    const { selectionBox, components } = get();
    if (!selectionBox) return;

    const minX = Math.min(selectionBox.startX, selectionBox.endX);
    const maxX = Math.max(selectionBox.startX, selectionBox.endX);
    const minY = Math.min(selectionBox.startY, selectionBox.endY);
    const maxY = Math.max(selectionBox.startY, selectionBox.endY);

    const selectedIds = components
      .filter(comp => 
        comp.x >= minX && comp.x <= maxX && 
        comp.y >= minY && comp.y <= maxY
      )
      .map(comp => comp.id);

    set({
      selectedComponents: selectedIds,
      isSelecting: false,
      selectionBox: null
    });
  },

  cancelSelection: () => {
    set({
      isSelecting: false,
      selectionBox: null,
      selectedComponents: []
    });
  },

  moveSelectedComponents: (deltaX, deltaY) => {
    const { selectedComponents } = get();
    set(state => ({
      components: state.components.map(comp =>
        selectedComponents.includes(comp.id)
          ? { ...comp, x: comp.x + deltaX, y: comp.y + deltaY }
          : comp
      )
    }));
    get().calculateLogic();
  },

  removeWire: (wireId) => {
    set(state => ({
      connections: state.connections.filter(conn => conn.id !== wireId)
    }));
    get().calculateLogic();
  },

  removeComponent: (componentId) => {
    set(state => ({
      connections: state.connections.filter(conn =>
        conn.fromComponent !== componentId && conn.toComponent !== componentId
      ),
      components: state.components.filter(comp => comp.id !== componentId),
      selectedComponents: state.selectedComponents.filter(id => id !== componentId)
    }));
    get().calculateLogic();
  },

  removeSelectedComponents: () => {
    const { selectedComponents } = get();
    selectedComponents.forEach(id => get().removeComponent(id));
  },

  updateInputValue: (componentId, value) => {
    set(state => ({
      components: state.components.map(comp =>
        comp.id === componentId ? { ...comp, output: value } : comp
      )
    }));
    get().calculateLogic();
  },

  clearAll: () => {
    set({
      components: [],
      connections: [],
      wires: [],
      selectedComponents: [],
      isDrawingWire: false,
      wireStart: null,
      tempWire: null,
      isSelecting: false,
      selectionBox: null
    });
  },

  startPanning: (x, y) => {
    const { stagePosition } = get();
    set({
      isPanning: true,
      panStart: { x: x - stagePosition.x, y: y - stagePosition.y }
    });
  },

  updatePanning: (x, y) => {
    const { panStart } = get();
    if (panStart) {
      set({ stagePosition: { x: x - panStart.x, y: y - panStart.y } });
    }
  },

  finishPanning: () => {
    set({ isPanning: false, panStart: null });
  },

  setZoom: (scale, x, y) => {
    set({ stageScale: scale, stagePosition: { x, y } });
  },

  selectAllComponents: () => {
    const { components } = get();
    set({ selectedComponents: components.map(c => c.id) });
  },

  duplicateSelectedComponents: () => {
    const { selectedComponents, components, connections, nextId, nextConnectionId } = get();

    if (selectedComponents.length === 0) return;

    // Map old IDs to new IDs
    const idMap = {};
    let currentNextId = nextId;

    // Create duplicate components (offset 50px down)
    const duplicates = selectedComponents.map(id => {
      const original = components.find(c => c.id === id);
      if (!original) return null;

      const newId = currentNextId++;
      idMap[id] = newId;

      return {
        ...original,
        id: newId,
        y: original.y + 50  // Place 50px below
      };
    }).filter(Boolean);

    // Create duplicate connections (only for internal connections within selected components)
    const duplicateConnections = [];
    let currentConnectionId = nextConnectionId;

    connections.forEach(conn => {
      const fromSelected = selectedComponents.includes(conn.fromComponent);
      const toSelected = selectedComponents.includes(conn.toComponent);

      // Only duplicate if both endpoints are in the selection
      if (fromSelected && toSelected) {
        duplicateConnections.push({
          ...conn,
          id: currentConnectionId++,
          fromComponent: idMap[conn.fromComponent],
          toComponent: idMap[conn.toComponent]
        });
      }
    });

    set(state => ({
      components: [...state.components, ...duplicates],
      connections: [...state.connections, ...duplicateConnections],
      nextId: currentNextId,
      nextConnectionId: currentConnectionId,
      selectedComponents: duplicates.map(c => c.id)  // Select the new duplicates
    }));

    get().calculateLogic();
  },

  saveCircuit: (name) => {
    const { components, connections } = get();
    const circuit = {
      name,
      timestamp: Date.now(),
      components,
      connections
    };

    const savedCircuits = JSON.parse(localStorage.getItem('savedCircuits') || '[]');
    savedCircuits.push(circuit);
    localStorage.setItem('savedCircuits', JSON.stringify(savedCircuits));

    return circuit.timestamp;
  },

  loadCircuit: (circuit) => {
    set({
      components: circuit.components,
      connections: circuit.connections,
      selectedComponents: [],
      isDrawingWire: false,
      wireStart: null,
      tempWire: null
    });
    get().calculateLogic();
  },

  getSavedCircuits: () => {
    return JSON.parse(localStorage.getItem('savedCircuits') || '[]');
  },

  deleteCircuit: (timestamp) => {
    const savedCircuits = JSON.parse(localStorage.getItem('savedCircuits') || '[]');
    const filtered = savedCircuits.filter(c => c.timestamp !== timestamp);
    localStorage.setItem('savedCircuits', JSON.stringify(filtered));
  },

  exportToJSON: () => {
    const { components, connections } = get();
    return JSON.stringify({ components, connections }, null, 2);
  },

  importFromJSON: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.components && data.connections) {
        set({
          components: data.components,
          connections: data.connections,
          selectedComponents: [],
          isDrawingWire: false,
          wireStart: null,
          tempWire: null
        });
        get().calculateLogic();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Invalid JSON:', error);
      return false;
    }
  },

  calculateLogic: () => {
    const { components, connections } = get();
    let updatedComponents = [...components];

    // Run multiple passes to handle long chains (max 10 passes)
    for (let pass = 0; pass < 10; pass++) {
      let hasChanges = false;
      const previousState = updatedComponents.map(c => ({ ...c, inputs: [...c.inputs] }));

      // Reset all inputs first (except INPUT components which have no inputs)
      updatedComponents = updatedComponents.map(comp => ({
        ...comp,
        inputs: comp.inputs ? comp.inputs.map(() => false) : []
      }));

      // Apply connections
      // eslint-disable-next-line no-loop-func
      connections.forEach(conn => {
        const fromComp = updatedComponents.find(c => c.id === conn.fromComponent);
        const toCompIndex = updatedComponents.findIndex(c => c.id === conn.toComponent);

        if (fromComp && toCompIndex !== -1 && updatedComponents[toCompIndex].inputs) {
          updatedComponents[toCompIndex].inputs[conn.toPin] = fromComp.output;
        }
      });

      // Calculate gate outputs
      updatedComponents = updatedComponents.map(comp => {
        if (comp.type === 'INPUT') return comp; // Input values are set manually

        let output = false;
        switch (comp.type) {
          case 'AND':
            output = comp.inputs[0] && comp.inputs[1];
            break;
          case 'OR':
            output = comp.inputs[0] || comp.inputs[1];
            break;
          case 'NOT':
            output = !comp.inputs[0];
            break;
          case 'XOR':
            output = comp.inputs[0] !== comp.inputs[1];
            break;
          case 'OUTPUT':
            output = comp.inputs[0] || false;
            break;
          case 'BINARY_DISPLAY':
            // Binary display doesn't change its output based on inputs
            output = comp.output;
            break;
          default:
            // Unknown component type - preserve existing output
            output = comp.output;
            break;
        }

        return { ...comp, output };
      });

      // Check if anything changed
      for (let i = 0; i < updatedComponents.length; i++) {
        const current = updatedComponents[i];
        const previous = previousState[i];
        
        if (current.output !== previous.output) {
          hasChanges = true;
          break;
        }
        
        if (current.inputs.length !== previous.inputs.length) {
          hasChanges = true;
          break;
        }
        
        for (let j = 0; j < current.inputs.length; j++) {
          if (current.inputs[j] !== previous.inputs[j]) {
            hasChanges = true;
            break;
          }
        }
        
        if (hasChanges) break;
      }

      // If no changes occurred, we're done
      if (!hasChanges) break;
    }

    // Generate wire visualization with better positioning
    const wires = connections.map(conn => {
      const fromComp = updatedComponents.find(c => c.id === conn.fromComponent);
      const toComp = updatedComponents.find(c => c.id === conn.toComponent);
      
      if (!fromComp || !toComp) return null;

      // Calculate pin positions more accurately
      let fromX, fromY, toX, toY;

      // From pin (output) - matches gate component designs
      if (fromComp.type === 'INPUT') {
        fromX = fromComp.x + 75;
        fromY = fromComp.y + 25;
      } else if (fromComp.type === 'OUTPUT') {
        fromX = fromComp.x + 75;
        fromY = fromComp.y + 25;
      } else if (fromComp.type === 'BINARY_DISPLAY') {
        fromX = fromComp.x + 105;
        fromY = fromComp.y + 40;
      } else if (fromComp.type === 'AND') {
        fromX = fromComp.x + 70;
        fromY = fromComp.y + 25;
      } else if (fromComp.type === 'OR') {
        fromX = fromComp.x + 55;
        fromY = fromComp.y + 25;
      } else if (fromComp.type === 'XOR') {
        fromX = fromComp.x + 60;
        fromY = fromComp.y + 25;
      } else if (fromComp.type === 'NOT') {
        fromX = fromComp.x + 70;
        fromY = fromComp.y + 25;
      } else {
        // Fallback for any other gate types
        fromX = fromComp.x + 70;
        fromY = fromComp.y + 25;
      }

      // To pin (input) - matches gate component designs
      if (toComp.type === 'BINARY_DISPLAY') {
        toX = toComp.x + 0;
        toY = toComp.y + 75 + (conn.toPin * 15);
      } else if (toComp.type === 'NOT') {
        toX = toComp.x + 0;
        toY = toComp.y + 25;
      } else if (toComp.type === 'OUTPUT') {
        toX = toComp.x - 5;
        toY = toComp.y + 25;
      } else if (toComp.type === 'XOR') {
        toX = toComp.x + 0;
        toY = toComp.y + (conn.toPin === 0 ? 15 : 35);
      } else {
        // AND/OR gate inputs
        toX = toComp.x + 0;
        toY = toComp.y + (conn.toPin === 0 ? 15 : 35);
      }

      return {
        id: conn.id,
        startX: fromX,
        startY: fromY,
        endX: toX,
        endY: toY,
        isActive: fromComp.output
      };
    }).filter(Boolean);

    set({
      components: updatedComponents,
      wires
    });
  }
}));

export default useSimulatorStore;