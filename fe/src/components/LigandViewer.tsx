import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol';

const LigandViewer = ({
  data,
  format = 'mol',
  fromUrl = false,
  style = {},
  width = 600,
  height = 450,
}) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!data || !viewerRef.current) return;

    const viewer = $3Dmol.createViewer(viewerRef.current, {
      backgroundColor: 'white',
    });

    const applyStyleAndRender = () => {
      viewer.setStyle(
        {},
        Object.keys(style).length ? style : { stick: {}, sphere: { scale: 0.3 } }
      );
      viewer.zoomTo();
      viewer.render();
      viewer.zoom(0.8);  
    };

    if (fromUrl) {
      // Fetch the molecule file, then addModel
      fetch(data)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.text();
        })
        .then((molText) => {
          viewer.addModel(molText, format);
          applyStyleAndRender();
        })
        .catch((err) => {
          console.error('Failed to load molecule:', err);
          alert('Failed to load molecule from URL');
        });
    } else {
      viewer.addModel(data, format);
      applyStyleAndRender();
    }
  }, [data, format, fromUrl, style]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
      <div
        ref={viewerRef}
        style={{
          width,
          height,
          position: 'relative',
        }}
      />
    </div>
  );
};

export default LigandViewer;
