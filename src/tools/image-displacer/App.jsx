import React, { useState, useCallback, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import SurfaceViewer from './SurfaceViewer';
import './App.css';

// Defaults
const DEFAULT_DISPLACEMENT_SCALE = 15;
const DEFAULT_FRAME_THICKNESS_ABS = 1.0;
const DEFAULT_FRAME_COLOR = '#ffffff';

function App() {
  // State for image URLs
  const [textureUrl, setTextureUrl] = useState(null);
  const [depthMapUrl, setDepthMapUrl] = useState(null);

  // State for displacement intensity
  const [displacementScale, setDisplacementScale] = useState(DEFAULT_DISPLACEMENT_SCALE);

  // State for depth inversion (near/far treatment) — default true so dark areas extrude toward viewer
  const [invertDepth, setInvertDepth] = useState(true);

  // State for Frame
  const [addFrame, setAddFrame] = useState(false);
  const [frameThicknessAbs, setFrameThicknessAbs] = useState(DEFAULT_FRAME_THICKNESS_ABS);
  const [frameColor, setFrameColor] = useState(DEFAULT_FRAME_COLOR);

  // State for GLTF Export Trigger
  const [exportTrigger, setExportTrigger] = useState(0);

  // --- Cleanup Logic ---
  const [urlsToRevoke, setUrlsToRevoke] = useState([]);
  const updateUrl = (setter, newUrl) => {
    setter(prevUrl => {
      if (prevUrl && prevUrl.startsWith('blob:')) {
        setUrlsToRevoke(prev => [...prev, prevUrl]);
      }
      return newUrl;
    });
  };
  useEffect(() => {
    if (urlsToRevoke.length > 0) {
      const urls = [...urlsToRevoke];
      setUrlsToRevoke([]);
      urls.forEach(url => {
        console.log("App: Revoking old Object URL:", url);
        URL.revokeObjectURL(url);
      });
    }
  }, [urlsToRevoke]);

  // --- Handlers ---
  const handleTextureChange = useCallback((url) => updateUrl(setTextureUrl, url), []);
  const handleDepthMapChange = useCallback((url) => updateUrl(setDepthMapUrl, url), []);
  const handleScaleChange = (event) => setDisplacementScale(parseFloat(event.target.value));
  const handleFrameThicknessAbsChange = (event) => setFrameThicknessAbs(parseFloat(event.target.value));
  const handleFrameColorChange = (event) => setFrameColor(event.target.value);

  const handleReset = useCallback(() => {
    if (textureUrl && textureUrl.startsWith('blob:')) setUrlsToRevoke(prev => [...prev, textureUrl]);
    if (depthMapUrl && depthMapUrl.startsWith('blob:')) setUrlsToRevoke(prev => [...prev, depthMapUrl]);
    setTextureUrl(null);
    setDepthMapUrl(null);
    setDisplacementScale(DEFAULT_DISPLACEMENT_SCALE);
    setInvertDepth(true);
    setAddFrame(false);
    setFrameThicknessAbs(DEFAULT_FRAME_THICKNESS_ABS);
    setFrameColor(DEFAULT_FRAME_COLOR);
  }, [textureUrl, depthMapUrl]);

  // GLTF Export Handler
  const handleExport = () => {
    if (textureUrl && depthMapUrl) {
      console.log("App: Triggering GLTF Export...");
      setExportTrigger(c => c + 1);
    } else {
      console.warn("App: Cannot export, missing texture or depth map.");
    }
  };

  return (
    <div className="app-container">
      {/* Left Panel: Controls */}
      <div className="control-panel">
        {/* Header */}
        <div className="panel-header">
          <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h1>3D Displacement Viewer</h1>
        </div>

        {/* Generate Depth Maps tip */}
        <div className="info-box">
          <div className="info-box-title">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Generate Depth Maps with AI
          </div>
          <p>
            Use{' '}
            <a
              href="https://huggingface.co/spaces/depth-anything/Depth-Anything-V2"
              target="_blank"
              rel="noopener noreferrer"
              className="info-link"
            >
              Depth Anything V2
            </a>{' '}
            to create 8-bit grayscale depth maps from your photos.
          </p>
        </div>

        {/* Image Upload Component */}
        <ImageUploader
          onTextureChange={handleTextureChange}
          onDepthMapChange={handleDepthMapChange}
          onReset={handleReset}
        />

        {/* Settings Section */}
        <div className="settings-card">
          <h2 className="settings-title">Settings</h2>

          {/* Displacement Scale */}
          <div className="setting-row">
            <div className="setting-label-row">
              <label htmlFor="displacementScale" className="setting-label">Displacement Scale</label>
              <span className="setting-value">{displacementScale.toFixed(1)}</span>
            </div>
            <input
              id="displacementScale"
              type="range" min="0" max="100" step="0.5"
              value={displacementScale}
              onChange={handleScaleChange}
              className="range-input"
              disabled={!depthMapUrl}
            />
          </div>

          {/* Invert Depth (near/far toggle) */}
          <div className="setting-row">
            <div className="toggle-row">
              <div>
                <span className="setting-label">Invert Depth</span>
                <p className="setting-hint">
                  {invertDepth ? 'Black = near (extrudes toward viewer)' : 'White = near (extrudes toward viewer)'}
                </p>
              </div>
              <button
                role="switch"
                aria-checked={invertDepth}
                onClick={() => setInvertDepth(v => !v)}
                disabled={!depthMapUrl}
                className={`toggle-switch ${invertDepth ? 'toggle-on' : 'toggle-off'}`}
              >
                <span className={`toggle-thumb ${invertDepth ? 'toggle-thumb-on' : 'toggle-thumb-off'}`} />
              </button>
            </div>
          </div>

          {/* Frame Options */}
          <fieldset className="fieldset-group">
            <legend className="fieldset-legend">Frame Options</legend>

            <div className="toggle-row">
              <label htmlFor="addFrame" className="setting-label">Add Outer Frame</label>
              <button
                id="addFrame"
                role="switch"
                aria-checked={addFrame}
                onClick={() => setAddFrame(v => !v)}
                disabled={!depthMapUrl || !textureUrl}
                className={`toggle-switch ${addFrame ? 'toggle-on' : 'toggle-off'}`}
              >
                <span className={`toggle-thumb ${addFrame ? 'toggle-thumb-on' : 'toggle-thumb-off'}`} />
              </button>
            </div>

            {addFrame && (
              <div className="setting-row">
                <div className="setting-label-row">
                  <label htmlFor="frameThicknessAbs" className="setting-label">Frame Width</label>
                  <span className="setting-value">{frameThicknessAbs.toFixed(1)} u</span>
                </div>
                <input
                  id="frameThicknessAbs"
                  type="range" min="0.1" max="5" step="0.1"
                  value={frameThicknessAbs}
                  onChange={handleFrameThicknessAbsChange}
                  className="range-input"
                  disabled={!depthMapUrl || !textureUrl}
                />
              </div>
            )}

            {addFrame && (
              <div className="setting-row">
                <label htmlFor="frameColor" className="setting-label">Frame Color</label>
                <input
                  id="frameColor"
                  type="color"
                  value={frameColor}
                  onChange={handleFrameColorChange}
                  className="color-input"
                  disabled={!depthMapUrl || !textureUrl}
                />
              </div>
            )}
          </fieldset>
        </div>

        {/* Export Button */}
        <div className="mt-5">
          <button
            onClick={handleExport}
            disabled={!textureUrl || !depthMapUrl}
            className="export-btn"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export as GLB Model
          </button>
          <p className="export-hint">Downloads the displaced mesh with texture as a .glb file.</p>
        </div>

        {/* How to Use */}
        <div className="how-to-card">
          <h3 className="how-to-title">How to Use</h3>
          <ol className="how-to-list">
            <li>Upload a color texture image.</li>
            <li>Upload an 8-bit grayscale depth map.</li>
            <li>Adjust the Displacement Scale slider.</li>
            <li>Toggle Invert Depth to switch near/far treatment.</li>
            <li>Optionally add an outer frame.</li>
            <li>Click Export to download the .glb file.</li>
            <li>Drag to rotate · Scroll to zoom · Right-drag to pan.</li>
          </ol>
          <p className="how-to-note">
            ⚠ 16-bit depth maps must be converted to 8-bit grayscale before use.
          </p>
        </div>
      </div>

      {/* Right Panel: 3D Viewer */}
      <div className="viewer-panel">
        <SurfaceViewer
          textureUrl={textureUrl}
          depthMapUrl={depthMapUrl}
          displacementScale={displacementScale}
          invertDepth={invertDepth}
          addFrame={addFrame}
          frameThicknessAbs={frameThicknessAbs}
          frameColor={frameColor}
          exportTrigger={exportTrigger}
        />
      </div>
    </div>
  );
}

export default App;
