import React, { useState } from 'react';
import './HelpPanel.css';

const HelpPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`help-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {isExpanded ? (
        <div className="help-content">
          <div className="help-header">
            <h3>Logic Gate Simulator - Help</h3>
            <button onClick={() => setIsExpanded(false)} className="close-button">×</button>
          </div>

          <div className="help-sections">
            <section>
              <h4>Getting Started</h4>
              <ul>
                <li>Click buttons in the toolbar to add components to the canvas</li>
                <li>Drag components to move them around</li>
                <li>Click an output pin, then click an input pin to create a wire</li>
                <li>Click input switches to toggle them ON/OFF</li>
                <li>Double-click any component to delete it</li>
              </ul>
            </section>

            <section>
              <h4>Keyboard Shortcuts</h4>
              <ul>
                <li><strong>Delete/Backspace</strong> - Delete selected components</li>
                <li><strong>Escape</strong> - Cancel wire drawing or clear selection</li>
                <li><strong>Ctrl+A</strong> - Select all components</li>
                <li><strong>Arrow keys</strong> - Move selected components (Shift for 10px)</li>
                <li><strong>Space+Drag</strong> - Pan the canvas</li>
              </ul>
            </section>

            <section>
              <h4>Selection Tips</h4>
              <ul>
                <li>Click and drag on empty canvas to create a selection box</li>
                <li>Selected components have an orange highlight</li>
                <li>Move multiple components together after selecting them</li>
                <li>Click empty space to clear selection</li>
              </ul>
            </section>

            <section>
              <h4>Components</h4>
              <ul>
                <li><strong>AND Gate</strong> - Output is ON when both inputs are ON</li>
                <li><strong>OR Gate</strong> - Output is ON when at least one input is ON</li>
                <li><strong>NOT Gate</strong> - Output is opposite of input</li>
                <li><strong>XOR Gate</strong> - Output is ON when inputs are different</li>
                <li><strong>Binary Display</strong> - Shows decimal value of 8-bit binary input</li>
              </ul>
            </section>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsExpanded(true)} className="help-toggle">
          ? Help
        </button>
      )}
    </div>
  );
};

export default HelpPanel;
