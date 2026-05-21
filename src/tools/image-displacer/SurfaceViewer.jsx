import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
// --- Import GLTFExporter ---
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// --- Configuration ---
const MAX_SEGMENTS = 256;
const IMAGE_PLANE_SIZE = 50;

// --- Helper: Image Processing (Depth Map) ---
const loadDepthImageData = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return reject(new Error('Could not get 2D context.'));
      ctx.drawImage(img, 0, 0);
      try {
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve({ imageData, width: img.width, height: img.height });
      } catch (error) { console.error("Canvas getImageData error:", error); reject(new Error(`Could not get image data: ${error.message}.`)); }
    };
    img.onerror = (err) => { console.error("Error loading depth image:", err); reject(new Error('Failed to load the depth map image.')); };
    img.src = imageUrl;
  });
};

// --- Helper: Trigger Download ---
function downloadFile(blob, filename) {
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link); // Required for Firefox

  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.click();

  // Clean up
  URL.revokeObjectURL(url);
  document.body.removeChild(link);
}


// --- 3D Component: The Displaced Surface Mesh ---
function DisplacedMesh({
    textureUrl,
    depthMapUrl,
    displacementScale,
    invertDepth,
    addFrame,
    frameThicknessAbs,
    frameColor,
    // --- Receive Export Trigger ---
    exportTrigger
}) {
  // Ref to the mesh itself is crucial for export
  const meshRef = useRef(null);

  // States for texture, depth, geometry...
  const [processedColorMap, setProcessedColorMap] = useState(null); // This is the CanvasTexture for display
  const [isLoadingTexture, setIsLoadingTexture] = useState(false);
  const [textureError, setTextureError] = useState(null);
  const [textureInfo, setTextureInfo] = useState(null);
  const [depthInfo, setDepthInfo] = useState(null);
  const [isLoadingDepth, setIsLoadingDepth] = useState(false);
  const [depthError, setDepthError] = useState(null);
  const [geometry, setGeometry] = useState(null);
  // --- State for Export status ---
  const [isExporting, setIsExporting] = useState(false);


  // --- Effect to Load and Process Color Texture ---
  useEffect(() => {
     // ... (This logic remains the same - creates the CanvasTexture) ...
     if (!textureUrl) { setProcessedColorMap(null); setTextureError(null); setIsLoadingTexture(false); setTextureInfo(null); return; }
     let isMounted = true; setIsLoadingTexture(true); setTextureError(null); setTextureInfo(null);
     setProcessedColorMap(prevTexture => { if (prevTexture) { console.log("Disposing previous color texture map"); prevTexture.dispose(); } return null; });
     console.log("Attempting to load and process color texture:", textureUrl);
     const img = new Image(); img.crossOrigin = 'Anonymous';
     img.onload = () => {
         if (!isMounted) return;
         console.log("Color texture image loaded:", img.width, "x", img.height);
         if (isMounted) setTextureInfo({ width: img.width, height: img.height });
         const pixelsPerWorldUnitW = img.width / IMAGE_PLANE_SIZE;
         const imagePlaneHeightWorld = IMAGE_PLANE_SIZE / (img.width / img.height);
         const pixelsPerWorldUnitH = img.height / imagePlaneHeightWorld;
         const framePixelW = addFrame ? Math.floor(frameThicknessAbs * pixelsPerWorldUnitW) : 0;
         const framePixelH = addFrame ? Math.floor(frameThicknessAbs * pixelsPerWorldUnitH) : 0;
         const totalCanvasWidth = img.width + 2 * framePixelW;
         const totalCanvasHeight = img.height + 2 * framePixelH;
         console.log(`Texture Canvas: Image=${img.width}x${img.height}, FramePixels(W,H)=${framePixelW}x${framePixelH}, Total=${totalCanvasWidth}x${totalCanvasHeight}`);
         const canvas = document.createElement('canvas'); canvas.width = totalCanvasWidth; canvas.height = totalCanvasHeight;
         const ctx = canvas.getContext('2d');
         if (!ctx) { if (isMounted) { setTextureError('Could not get 2D context for texture processing.'); setIsLoadingTexture(false); } return; }
         if (addFrame && framePixelW > 0 && framePixelH > 0) { ctx.fillStyle = frameColor; ctx.fillRect(0, 0, totalCanvasWidth, totalCanvasHeight); }
         ctx.drawImage(img, framePixelW, framePixelH, img.width, img.height);
         const newTexture = new THREE.CanvasTexture(canvas);
         newTexture.name = "ProcessedDisplacementTexture";
         newTexture.needsUpdate = true;
         if (isMounted) { setProcessedColorMap(newTexture); console.log("Processed color texture created."); setIsLoadingTexture(false); }
         else { newTexture.dispose(); }
     };
     img.onerror = (err) => { console.error("Error loading color texture image:", err); if (isMounted) { setTextureError('Failed to load the color texture image.'); setIsLoadingTexture(false); } };
     img.src = textureUrl;
     return () => { isMounted = false; console.log("Cleaning up texture processing effect for:", textureUrl); };
  }, [textureUrl, addFrame, frameThicknessAbs, frameColor]);


  // --- Effect to Load Depth Map ---
  useEffect(() => {
     // ... (This logic remains the same) ...
     if (!depthMapUrl) { setDepthInfo(null); setDepthError(null); setIsLoadingDepth(false); setGeometry(null); return; }
     let isMounted = true; setIsLoadingDepth(true); setDepthError(null); setDepthInfo(null); setGeometry(null);
     console.log("Attempting to load depth map:", depthMapUrl);
     loadDepthImageData(depthMapUrl)
       .then(result => { if (isMounted) { console.log("Depth map loaded:", result.width, "x", result.height); setDepthInfo(result); }})
       .catch(error => { if (isMounted) { console.error("Depth map processing error:", error); setDepthError(error.message); }})
       .finally(() => { if (isMounted) setIsLoadingDepth(false); });
     return () => { isMounted = false; };
  }, [depthMapUrl]);

  // --- Effect to Create Geometry ---
  useEffect(() => {
     // ... (This logic remains the same) ...
     let newGeom = null;
     if (depthInfo && textureInfo) {
         const imgWidth = textureInfo.width; const imgHeight = textureInfo.height; const aspectRatio = imgWidth / imgHeight;
         const frameW = addFrame ? frameThicknessAbs : 0;
         const totalPlaneWidth = IMAGE_PLANE_SIZE + 2 * frameW;
         const imagePlaneHeight = IMAGE_PLANE_SIZE / aspectRatio;
         const totalPlaneHeight = imagePlaneHeight + 2 * frameW;
         const segmentsW = Math.min(imgWidth, MAX_SEGMENTS); const segmentsH = Math.min(imgHeight, MAX_SEGMENTS);
         console.log("Creating Plane Geometry state:", imgWidth, "x", imgHeight);
         console.log(`Total Plane dimensions: ${totalPlaneWidth.toFixed(2)}x${totalPlaneHeight.toFixed(2)}, Segments: ${segmentsW}x${segmentsH}`);
         newGeom = new THREE.PlaneGeometry(totalPlaneWidth, totalPlaneHeight, segmentsW - 1, segmentsH - 1);
         newGeom.name = "DisplacedPlaneGeometry";
         setGeometry(newGeom);
     } else { setGeometry(null); }
     return () => { if (newGeom) { console.log("Disposing geometry associated with previous info"); newGeom.dispose(); } }
  }, [depthInfo, textureInfo, addFrame, frameThicknessAbs]);


  // --- Effect to Apply Displacement ---
  useEffect(() => {
     // ... (This logic remains the same) ...
     console.log("Displacement Effect triggered. Checking conditions...", { hasGeom: !!geometry, hasDepthInfo: !!depthInfo, hasTexture: !!processedColorMap, isLoadingD: isLoadingDepth, hasErrorD: !!depthError, isLoadingT: isLoadingTexture, hasErrorT: !!textureError });
     if (!geometry || !depthInfo || !processedColorMap) { console.log("Skipping displacement: Core data not ready."); return; }
     if (isLoadingDepth || depthError || isLoadingTexture || textureError) { console.log("Skipping displacement: Loading or error state active."); return; }
     if (!textureInfo) { console.log("Skipping displacement: Texture dimensions not ready."); return; }
     console.log(`Applying displacement... Scale: ${displacementScale}, Frame: ${addFrame}, Thickness: ${frameThicknessAbs}`);
     const geom = geometry; const { imageData, width: depthW, height: depthH } = depthInfo; const { width: texW, height: texH } = textureInfo;
     const positionAttribute = geom.attributes.position;
     if (!positionAttribute) { console.error("Geometry missing position attribute."); return; }
     const imgAspectRatio = texW / texH; const imagePlaneHeight = IMAGE_PLANE_SIZE / imgAspectRatio; const halfImageW = IMAGE_PLANE_SIZE / 2; const halfImageH = imagePlaneHeight / 2;
     let loggedCount = 0; const LOG_LIMIT = 5;
     console.time("Displacement Calculation");
     for (let i = 0; i < positionAttribute.count; i++) {
       const x = positionAttribute.getX(i); const y = positionAttribute.getY(i); let zOffset = 0;
       const isInsideImage = Math.abs(x) <= halfImageW && Math.abs(y) <= halfImageH;
       if (addFrame && !isInsideImage) { /* Frame */ }
       else { /* Image */
           const u = (x + halfImageW) / IMAGE_PLANE_SIZE; const v = 1.0 - ((y + halfImageH) / imagePlaneHeight);
           const uClamped = Math.max(0, Math.min(1, u)); const vClamped = Math.max(0, Math.min(1, v));
           const pixelX = Math.floor(uClamped * (depthW - 1)); const pixelY = Math.floor(vClamped * (depthH - 1));
           const pixelIndex = (pixelY * depthW + pixelX) * 4;
           const depthValue = imageData.data[pixelIndex]; const normalizedDepth = depthValue / 255.0;
           const effectiveDepth = invertDepth ? (1.0 - normalizedDepth) : normalizedDepth;
           zOffset = effectiveDepth * displacementScale;
           if (loggedCount < LOG_LIMIT && i % Math.floor(positionAttribute.count / LOG_LIMIT || 1) === 0) { console.log(`Vertex ${i}: Pos=(${x.toFixed(2)}, ${y.toFixed(2)}), InImage=${isInsideImage}, UV=(${u.toFixed(3)}, ${v.toFixed(3)}), DepthValue=${depthValue}, Z-Offset=${zOffset.toFixed(3)}`); loggedCount++; }
       }
       positionAttribute.setZ(i, zOffset);
     }
     console.timeEnd("Displacement Calculation");
     positionAttribute.needsUpdate = true; geom.computeVertexNormals();
     console.log("Displacement applied (using state geometry).");
  }, [geometry, depthInfo, textureInfo, processedColorMap, displacementScale, invertDepth, isLoadingDepth, depthError, addFrame, frameThicknessAbs, isLoadingTexture, textureError]);


  // --- Effect for GLTF Export ---
  useEffect(() => {
    // --- Store original material ---
    let originalMaterial = null;
    let exportTexture = null; // Texture created specifically for export
    let clonedMaterial = null; // Material created specifically for export

    const performExport = async () => {
        if (!meshRef.current || !geometry || !processedColorMap || !meshRef.current.material) {
            console.error("Export failed: Mesh, geometry, material, or texture not ready.");
            return;
        }
        const canvas = processedColorMap.image;
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            console.error("Export failed: Processed color map image source is not a ready canvas.");
            return;
        }

        console.log("Starting GLTF export (Data URL method)...");
        setIsExporting(true);

        // --- Create Texture from Data URL ---
        try {
            console.log("Converting canvas to Data URL...");
            const dataUrl = canvas.toDataURL('image/png'); // Or 'image/jpeg'
            console.log("Data URL created (length):", dataUrl.length);

            // Load this data URL as a new texture
            const loader = new THREE.TextureLoader();
            exportTexture = await loader.loadAsync(dataUrl); // Use async loading
            exportTexture.name = "ExportedTexture";
            // Important for GLTF: Texture encoding often needs to be sRGB for colors
            exportTexture.colorSpace = THREE.SRGBColorSpace;
            // Ensure texture flipping matches the original (usually true for CanvasTexture)
            exportTexture.flipY = false; // GLTF standard is false
            exportTexture.needsUpdate = true;
            console.log("Export texture loaded from Data URL.");

            // --- Clone Material and Apply Export Texture ---
            originalMaterial = meshRef.current.material; // Store original
            clonedMaterial = originalMaterial.clone(); // Clone it
            clonedMaterial.map = exportTexture; // Assign the new texture
            clonedMaterial.needsUpdate = true; // Update material
            meshRef.current.material = clonedMaterial; // Temporarily assign cloned material
            console.log("Cloned material assigned with export texture.");

        } catch (loadError) {
            console.error("Error creating/loading texture from Data URL:", loadError);
            setIsExporting(false);
            return; // Stop export if texture creation fails
        }
        // --- End Texture Creation ---


        const exporter = new GLTFExporter();
        const options = {
            binary: true,
            embedImages: true, // Still needed to embed the Data URL texture
            trs: false,
            onlyVisible: false,
        };

        const objectToExport = meshRef.current;

        try {
            exporter.parse(
                objectToExport,
                (gltf) => { // onLoad
                    console.log("GLTF export successful.");
                    if (gltf instanceof ArrayBuffer) {
                        downloadFile(new Blob([gltf], { type: 'model/gltf-binary' }), 'displaced_mesh.glb');
                    } else {
                        const output = JSON.stringify(gltf, null, 2);
                        downloadFile(new Blob([output], { type: 'text/plain' }), 'displaced_mesh.gltf');
                    }
                },
                (error) => { // onError
                    console.error("GLTF export error callback:", error);
                },
                options
            );
        } catch (error) {
            console.error("GLTF exporter.parse() threw an error:", error);
        } finally {
            // --- Cleanup: Restore original material and dispose temporary assets ---
            console.log("Export finished or failed, cleaning up...");
            if (originalMaterial) {
                meshRef.current.material = originalMaterial; // Restore original material
                console.log("Original material restored.");
            }
            if (clonedMaterial) {
                clonedMaterial.dispose(); // Dispose cloned material
                console.log("Cloned material disposed.");
            }
            if (exportTexture) {
                exportTexture.dispose(); // Dispose texture created from data URL
                console.log("Export texture disposed.");
            }
            setIsExporting(false); // Reset exporting state
        }
    };

    if (exportTrigger > 0 && !isExporting) {
        performExport();
    }

    // Cleanup function for the effect itself (runs if component unmounts during export)
    return () => {
        // If an export was in progress and component unmounts, try to clean up
        if (isExporting) {
             console.warn("Component unmounted during export, attempting cleanup...");
             if (originalMaterial && meshRef.current) meshRef.current.material = originalMaterial;
             if (clonedMaterial) clonedMaterial.dispose();
             if (exportTexture) exportTexture.dispose();
             // Note: isExporting state won't be reset here as component is gone
        }
    }

    // Dependencies: Trigger, geometry, and the original processedColorMap (to get the canvas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportTrigger, geometry, processedColorMap]);


  // --- Component Unmount Cleanup for Texture ---
  useEffect(() => {
    return () => { if (processedColorMap) { console.log("Disposing final color texture map on unmount"); processedColorMap.dispose(); } }
  }, [processedColorMap]);


  // --- Render Logic ---
  if (isLoadingTexture || !textureInfo) return <StatusMessage>Processing texture...</StatusMessage>;
  if (textureError) return <StatusMessage color="red">Texture Error: {textureError}</StatusMessage>;
  if (isLoadingDepth) return <StatusMessage>Loading depth map...</StatusMessage>;
  if (depthError) return <StatusMessage color="red">Depth Map Error: {depthError}</StatusMessage>;
  if (!geometry || !processedColorMap) return <StatusMessage>Waiting for geometry or texture...</StatusMessage>;
  if (isExporting) return <StatusMessage>Exporting GLB...</StatusMessage>;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      receiveShadow
      name="DisplacedSurfaceMesh"
    >
      <meshStandardMaterial
        name="DisplacedSurfaceMaterial"
        map={processedColorMap} // Use the live CanvasTexture for display
        side={THREE.DoubleSide}
        roughness={0.6}
        metalness={0.1}
        // wireframe={true}
      />
    </mesh>
  );
}

// --- Status Message Component ---
function StatusMessage({ children, color = 'white', size = 0.5 }) {
  return ( <Text position={[0, 0, 0]} fontSize={size} color={color} anchorX="center" anchorY="middle" whiteSpace="overflowWrap" maxWidth={15}> {children} </Text> );
}

// --- Main Viewer Component ---
function SurfaceViewer({
    textureUrl,
    depthMapUrl,
    displacementScale,
    invertDepth,
    addFrame,
    frameThicknessAbs,
    frameColor,
    exportTrigger
}) {

  const gridWidth = IMAGE_PLANE_SIZE * 1.5;

  return (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 relative">
      <Canvas
        gl={{ preserveDrawingBuffer: true }} // IMPORTANT
        camera={{ position: [0, IMAGE_PLANE_SIZE * 0.15, IMAGE_PLANE_SIZE * 1.8], fov: 50 }}
        className="w-full h-full"
      >
        <ambientLight intensity={1.0} />
        <hemisphereLight skyColor={0xadd8e6} groundColor={0x444444} intensity={0.8} />
        <directionalLight position={[15, 30, 20]} intensity={0.3} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

        <Suspense fallback={<StatusMessage>Loading assets...</StatusMessage>}>
          {textureUrl && depthMapUrl ? (
            <DisplacedMesh
              textureUrl={textureUrl}
              depthMapUrl={depthMapUrl}
              displacementScale={displacementScale}
              invertDepth={invertDepth}
              addFrame={addFrame}
              frameThicknessAbs={frameThicknessAbs}
              frameColor={frameColor}
              exportTrigger={exportTrigger}
            />
          ) : (
            <StatusMessage>Upload texture and depth map to begin.</StatusMessage>
          )}
        </Suspense>

        <gridHelper args={[gridWidth, 20, '#888', '#aaa']} position={[0, -IMAGE_PLANE_SIZE * 0.5, 0]}/>
      </Canvas>
    </div>
  );
}

export default SurfaceViewer;
