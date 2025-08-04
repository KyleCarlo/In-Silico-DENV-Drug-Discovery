import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol';

const Viewer3D = ({ pdbId = '1BNA' }) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    const viewer = $3Dmol.createViewer(viewerRef.current, {
      backgroundColor: 'white',
    });

    $3Dmol.download(`pdb:${pdbId}`, viewer, {}, () => {
      viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
      viewer.zoomTo();
      viewer.render();
    });
  }, [pdbId]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
      <div
        ref={viewerRef}
        style={{
          width: '600px',
          height: '450px',
          position: 'relative', // Needed for canvas positioning
        }}
      >
        {/* Optional fallback styling if canvas doesn't fill */}
        <style>
          {`
            div[ref] canvas {
              width: 100% !important;
              height: 100% !important;
              position: absolute;
              top: 0;
              left: 0;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Viewer3D;
