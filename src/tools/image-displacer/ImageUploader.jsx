import React, { useRef } from 'react';

/**
 * Component for handling file inputs for texture and depth map images.
 * @param {object} props - Component props.
 * @param {function} props.onTextureChange - Callback function when texture file changes. Receives object URL or null.
 * @param {function} props.onDepthMapChange - Callback function when depth map file changes. Receives object URL or null.
 * @param {function} props.onReset - Callback function to reset both inputs.
 */
function ImageUploader({ onTextureChange, onDepthMapChange, onReset }) {
  // Refs to access the input elements directly if needed (e.g., to clear them)
  const textureInputRef = useRef(null);
  const depthInputRef = useRef(null);

  /**
   * Handles the change event for a file input.
   * Creates an object URL for the selected file and calls the appropriate callback.
   * @param {Event} event - The file input change event.
   * @param {function} callback - The callback function (onTextureChange or onDepthMapChange).
   */
  const handleFileChange = (event, callback) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a temporary URL representing the selected file
      const objectUrl = URL.createObjectURL(file);
      callback(objectUrl); // Pass the URL to the parent component
    } else {
      callback(null); // No file selected or selection cancelled
    }
  };

  /**
   * Handles the reset button click.
   * Clears the file inputs and calls the onReset callback.
   */
  const handleResetClick = () => {
     // Clear the file input visually
    if (textureInputRef.current) {
        textureInputRef.current.value = '';
    }
    if (depthInputRef.current) {
        depthInputRef.current.value = '';
    }
    // Call the parent's reset handler to clear the URLs in state
    onReset();
  }

  return (
    <div className="upload-card">
      <h2 className="upload-title">Upload Images</h2>

      {/* Texture Input */}
      <div className="upload-field">
        <label htmlFor="textureInput" className="upload-label">
          <span className="upload-step">1</span> Color Texture
        </label>
        <input
          ref={textureInputRef}
          id="textureInput"
          type="file"
          accept="image/png, image/jpeg, image/webp, image/avif"
          onChange={(e) => handleFileChange(e, onTextureChange)}
          className="file-input"
        />
      </div>

      {/* Depth Map Input */}
      <div className="upload-field">
        <label htmlFor="depthMapInput" className="upload-label">
          <span className="upload-step">2</span> Depth Map <span className="upload-label-hint">(8-bit grayscale)</span>
        </label>
        <input
          ref={depthInputRef}
          id="depthMapInput"
          type="file"
          accept="image/png, image/jpeg"
          onChange={(e) => handleFileChange(e, onDepthMapChange)}
          className="file-input"
        />
        <p className="upload-hint">White&nbsp;=&nbsp;near&nbsp;·&nbsp;Black&nbsp;=&nbsp;far</p>
      </div>

      {/* Reset Button */}
      <button onClick={handleResetClick} className="reset-btn">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
        Reset Images
      </button>
    </div>
  );
}

export default ImageUploader;
