import React, { useState, useEffect } from 'react';
import useSimulatorStore from '../../stores/simulatorStore';
import './SaveLoadPanel.css';

const SaveLoadPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [circuitName, setCircuitName] = useState('');
  const [savedCircuits, setSavedCircuits] = useState([]);
  const [showExportData, setShowExportData] = useState(false);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');

  const { saveCircuit, loadCircuit, getSavedCircuits, deleteCircuit, exportToJSON, importFromJSON } = useSimulatorStore();

  useEffect(() => {
    if (isExpanded) {
      refreshCircuits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const refreshCircuits = () => {
    setSavedCircuits(getSavedCircuits());
  };

  const handleSave = () => {
    if (circuitName.trim()) {
      saveCircuit(circuitName);
      setCircuitName('');
      refreshCircuits();
    }
  };

  const handleLoad = (circuit) => {
    loadCircuit(circuit);
    setIsExpanded(false);
  };

  const handleDelete = (timestamp) => {
    deleteCircuit(timestamp);
    refreshCircuits();
  };

  const handleExport = () => {
    const json = exportToJSON();
    setExportData(json);
    setShowExportData(true);

    // Also download as file
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circuit.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importFromJSON(importData)) {
      alert('Circuit imported successfully!');
      setImportData('');
      setIsExpanded(false);
    } else {
      alert('Invalid circuit data. Please check the JSON format.');
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportData(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`save-load-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {isExpanded ? (
        <div className="save-load-content">
          <div className="save-load-header">
            <h3>Save / Load Circuits</h3>
            <button onClick={() => setIsExpanded(false)} className="close-button">×</button>
          </div>

          <div className="save-load-sections">
            {/* Save Section */}
            <section className="save-section">
              <h4>Save Current Circuit</h4>
              <div className="save-controls">
                <input
                  type="text"
                  placeholder="Circuit name..."
                  value={circuitName}
                  onChange={(e) => setCircuitName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                />
                <button onClick={handleSave} disabled={!circuitName.trim()}>Save</button>
              </div>
            </section>

            {/* Saved Circuits Section */}
            <section className="circuits-section">
              <h4>Saved Circuits ({savedCircuits.length})</h4>
              <div className="circuits-list">
                {savedCircuits.length === 0 ? (
                  <p className="empty-message">No saved circuits yet</p>
                ) : (
                  savedCircuits.sort((a, b) => b.timestamp - a.timestamp).map(circuit => (
                    <div key={circuit.timestamp} className="circuit-item">
                      <div className="circuit-info">
                        <div className="circuit-name">{circuit.name}</div>
                        <div className="circuit-date">
                          {new Date(circuit.timestamp).toLocaleString()}
                        </div>
                        <div className="circuit-stats">
                          {circuit.components.length} components, {circuit.connections.length} wires
                        </div>
                      </div>
                      <div className="circuit-actions">
                        <button onClick={() => handleLoad(circuit)} className="load-btn">Load</button>
                        <button onClick={() => handleDelete(circuit.timestamp)} className="delete-btn">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Export/Import Section */}
            <section className="export-import-section">
              <h4>Export / Import</h4>
              <div className="export-import-controls">
                <button onClick={handleExport} className="export-btn">Export to JSON</button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  style={{ display: 'none' }}
                  id="import-file"
                />
                <label htmlFor="import-file" className="import-file-btn">
                  Import from File
                </label>
              </div>

              {showExportData && (
                <div className="export-data">
                  <textarea
                    readOnly
                    value={exportData}
                    rows="6"
                    placeholder="Exported JSON..."
                  />
                  <button onClick={() => setShowExportData(false)}>Close</button>
                </div>
              )}

              <div className="import-area">
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows="4"
                  placeholder="Paste JSON here to import..."
                />
                {importData && (
                  <button onClick={handleImport} className="import-btn">Import Circuit</button>
                )}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsExpanded(true)} className="save-load-toggle">
          💾 Save/Load
        </button>
      )}
    </div>
  );
};

export default SaveLoadPanel;
