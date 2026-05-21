import React, { useState } from 'react';
import './Toolbar.css';

const Toolbar = ({ onAddComponent, onClear }) => {
  const [collapsed, setCollapsed] = useState(true);

  const logicGates = [
    { type: 'AND', label: 'AND Gate', color: '#e3f2fd' },
    { type: 'OR', label: 'OR Gate', color: '#e8f5e8' },
    { type: 'NOT', label: 'NOT Gate', color: '#fff3e0' },
    { type: 'XOR', label: 'XOR Gate', color: '#f3e5f5' }
  ];

  const ioComponents = [
    { type: 'INPUT', label: 'Input Switch', color: '#e0f2f1' },
    { type: 'OUTPUT', label: 'Output LED', color: '#ffebee' },
    { type: 'BINARY_DISPLAY', label: 'Binary Display', color: '#f3e5f5' }
  ];

  return (
    <div className={`toolbar${collapsed ? ' toolbar-collapsed' : ''}`}>
      <div className="toolbar-header" onClick={() => setCollapsed(!collapsed)}>
        <h3>Components</h3>
        <span className="toolbar-toggle">{collapsed ? '▲' : '▼'}</span>
      </div>

      {!collapsed && (
        <>
          <div className="toolbar-section">
            <h4 className="toolbar-section-title">Logic Gates</h4>
            <div className="toolbar-grid">
              {logicGates.map((component) => (
                <button
                  key={component.type}
                  className="toolbar-button"
                  style={{ backgroundColor: component.color }}
                  onClick={() => onAddComponent(component.type)}
                >
                  {component.label}
                </button>
              ))}
            </div>
          </div>

          <div className="toolbar-separator"></div>

          <div className="toolbar-section">
            <h4 className="toolbar-section-title">Input / Output</h4>
            <div className="toolbar-grid">
              {ioComponents.map((component) => (
                <button
                  key={component.type}
                  className="toolbar-button"
                  style={{ backgroundColor: component.color }}
                  onClick={() => onAddComponent(component.type)}
                >
                  {component.label}
                </button>
              ))}
            </div>
          </div>

          <div className="toolbar-separator"></div>

          <button
            className="toolbar-button"
            style={{ backgroundColor: '#ffebee', fontWeight: 'bold' }}
            onClick={onClear}
          >
            Clear All
          </button>
        </>
      )}
    </div>
  );
};

export default Toolbar;