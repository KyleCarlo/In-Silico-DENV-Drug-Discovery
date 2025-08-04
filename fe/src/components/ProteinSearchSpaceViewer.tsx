import React, { useEffect, useRef, useCallback } from 'react';
import * as $3Dmol from '3dmol';

interface ProteinSearchSpaceViewerProps {
  pdbId?: string;
  searchSpace: {
    center_x: number;
    center_y: number;
    center_z: number;
    size_x: number;
    size_y: number;
    size_z: number;
  };
}

const ProteinSearchSpaceViewer: React.FC<ProteinSearchSpaceViewerProps> = ({
  pdbId = '2BMF',
  searchSpace,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewer3DRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const shapesRef = useRef<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Function to create/update search box
  const updateSearchBox = useCallback(() => {
    if (!viewer3DRef.current) return;

    // Remove existing shapes
    shapesRef.current.forEach(shape => {
      try {
        viewer3DRef.current?.removeShape(shape);
      } catch (error) {
        // Ignore errors when removing shapes
      }
    });
    shapesRef.current = [];

    const { center_x, center_y, center_z, size_x, size_y, size_z } = searchSpace;

    // Create box vertices
    const halfX = size_x / 2;
    const halfY = size_y / 2;
    const halfZ = size_z / 2;

    // Define the 8 vertices of the box
    const vertices = [
      [center_x - halfX, center_y - halfY, center_z - halfZ], // 0
      [center_x + halfX, center_y - halfY, center_z - halfZ], // 1
      [center_x + halfX, center_y + halfY, center_z - halfZ], // 2
      [center_x - halfX, center_y + halfY, center_z - halfZ], // 3
      [center_x - halfX, center_y - halfY, center_z + halfZ], // 4
      [center_x + halfX, center_y - halfY, center_z + halfZ], // 5
      [center_x + halfX, center_y + halfY, center_z + halfZ], // 6
      [center_x - halfX, center_y + halfY, center_z + halfZ], // 7
    ];

    // Define the edges of the box (12 edges)
    const edges = [
      // Bottom face
      [0, 1], [1, 2], [2, 3], [3, 0],
      // Top face
      [4, 5], [5, 6], [6, 7], [7, 4],
      // Vertical edges
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    try {
      // Create cylinder shapes for each edge
      edges.forEach(([start, end]) => {
        const startPos = vertices[start];
        const endPos = vertices[end];
        
        const cylinderShape = viewer3DRef.current?.addCylinder({
          start: { x: startPos[0], y: startPos[1], z: startPos[2] },
          end: { x: endPos[0], y: endPos[1], z: endPos[2] },
          radius: 0.3,
          color: 'cyan',
          alpha: 0.8,
        });
        
        if (cylinderShape) {
          shapesRef.current.push(cylinderShape);
        }
      });

      // Add corner spheres for better visibility
      vertices.forEach(([x, y, z]) => {
        const sphereShape = viewer3DRef.current?.addSphere({
          center: { x, y, z },
          radius: 0.5,
          color: 'blue',
          alpha: 0.6,
        });
        
        if (sphereShape) {
          shapesRef.current.push(sphereShape);
        }
      });

      // Add a semi-transparent box for the interior
      const boxShape = viewer3DRef.current?.addBox({
        center: { x: center_x, y: center_y, z: center_z },
        dimensions: { w: size_x, h: size_y, d: size_z },
        color: 'cyan',
        alpha: 0.1,
      });
      
      if (boxShape) {
        shapesRef.current.push(boxShape);
      }

      viewer3DRef.current?.render();
    } catch (error) {
      console.warn('Error updating search box:', error);
    }
  }, [searchSpace]);

  useEffect(() => {
    if (!viewerRef.current) return;

    // Initialize viewer
    const viewer = $3Dmol.createViewer(viewerRef.current, {
      backgroundColor: 'white',
    });
    viewer3DRef.current = viewer;

    // Load protein structure
    $3Dmol.download(`pdb:${pdbId}`, viewer, {}, () => {
      viewer.setStyle({}, { 
        cartoon: { 
          color: 'spectrum',
          opacity: 1 
        } 
      });
      
      // Set initial view
      viewer.zoomTo();
      viewer.render();
      
      // Add search box after protein is loaded
      setTimeout(() => {
        updateSearchBox();
      }, 500);
    });

    // Cleanup function
    return () => {
      if (viewer3DRef.current) {
        try {
          shapesRef.current.forEach(shape => {
            viewer3DRef.current?.removeShape(shape);
          });
          shapesRef.current = [];
          viewer3DRef.current.clear();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [pdbId, updateSearchBox]);

  // Update search box when parameters change
  useEffect(() => {
    if (viewer3DRef.current) {
      updateSearchBox();
    }
  }, [updateSearchBox]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
      <div
        ref={viewerRef}
        style={{
          width: '100%',
          height: '400px',
          position: 'relative',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
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

export default ProteinSearchSpaceViewer;
