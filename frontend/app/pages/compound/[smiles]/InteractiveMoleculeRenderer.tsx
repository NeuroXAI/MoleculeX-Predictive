"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { EnhancedSmilesParser } from "./EnhancedSmilesParser";

interface InteractiveMoleculeRendererProps {
  smiles: string;
  width?: number;
  height?: number;
}

interface Atom {
  element: string;
  x: number;
  y: number;
  id: number;
  bonds: number[];
  selected?: boolean;
  hovered?: boolean;
}

interface Bond {
  startAtom: number;
  endAtom: number;
  order: number;
  selected?: boolean;
  hovered?: boolean;
}

const InteractiveMoleculeRenderer: React.FC<InteractiveMoleculeRendererProps> = ({
  smiles,
  width = 600,
  height = 600,
}) => {
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hoveredAtom, setHoveredAtom] = useState<number | null>(null);
  const [selectedAtom, setSelectedAtom] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Memoized parser instance for better performance
  const parser = useMemo(() => new EnhancedSmilesParser(), []);

  // Efficient SMILES parsing with debouncing
  const parseSmiles = useCallback((smilesString: string) => {
    try {
      const result = parser.parse(smilesString);
      
      // Add interactive properties
      const interactiveAtoms = result.atoms.map(atom => ({
        ...atom,
        selected: false,
        hovered: false
      }));
      
      const interactiveBonds = result.bonds.map(bond => ({
        ...bond,
        selected: false,
        hovered: false
      }));

      setAtoms(interactiveAtoms);
      setBonds(interactiveBonds);
      setError(null);
    } catch (err) {
      setError("Failed to parse SMILES structure");
      console.error("SMILES parsing error:", err);
    }
  }, [parser]);

  useEffect(() => {
    if (smiles) {
      parseSmiles(smiles);
    }
  }, [smiles, parseSmiles]);

  // Memoized element colors for better performance
  const getElementColor = useCallback((element: string, isHovered: boolean, isSelected: boolean) => {
    const colors: { [key: string]: string } = {
      C: "#333333",
      H: "#ffffff",
      O: "#ff0000",
      N: "#0000ff",
      S: "#ffff00",
      P: "#ffa500",
      F: "#00ff00",
      Cl: "#00ff00",
      Br: "#8b4513",
      I: "#800080",
    };
    
    let color = colors[element] || "#cccccc";
    
    if (isSelected) {
      color = "#ffff00"; // Yellow for selected
    } else if (isHovered) {
      color = "#00ffff"; // Cyan for hovered
    }
    
    return color;
  }, []);

  // Interactive handlers
  const handleAtomClick = useCallback((atomId: number) => {
    setSelectedAtom(selectedAtom === atomId ? null : atomId);
  }, [selectedAtom]);

  const handleAtomMouseEnter = useCallback((atomId: number) => {
    setHoveredAtom(atomId);
  }, []);

  const handleAtomMouseLeave = useCallback(() => {
    setHoveredAtom(null);
  }, []);

  // Zoom and pan handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedAtom(null);
    setHoveredAtom(null);
  }, []);

  // Memoized bond rendering for better performance
  const renderBonds = useMemo(() => {
    return bonds.map((bond, index) => {
      const startAtom = atoms[bond.startAtom];
      const endAtom = atoms[bond.endAtom];
      
      if (!startAtom || !endAtom) return null;
      
      const isHovered = hoveredAtom === bond.startAtom || hoveredAtom === bond.endAtom;
      const isSelected = selectedAtom === bond.startAtom || selectedAtom === bond.endAtom;
      
      return (
        <line
          key={`bond-${index}`}
          x1={startAtom.x}
          y1={startAtom.y}
          x2={endAtom.x}
          y2={endAtom.y}
          stroke={isSelected ? "#ffff00" : isHovered ? "#00ffff" : "#ffffff"}
          strokeWidth={bond.order * 2 + (isHovered || isSelected ? 2 : 0)}
          strokeLinecap="round"
          style={{ cursor: "pointer" }}
        />
      );
    });
  }, [bonds, atoms, hoveredAtom, selectedAtom]);

  // Memoized atom rendering for better performance
  const renderAtoms = useMemo(() => {
    return atoms.map((atom) => {
      const isHovered = hoveredAtom === atom.id;
      const isSelected = selectedAtom === atom.id;
      
      return (
        <g key={`atom-${atom.id}`}>
          <circle
            cx={atom.x}
            cy={atom.y}
            r={12 + (isHovered || isSelected ? 4 : 0)}
            fill={getElementColor(atom.element, isHovered, isSelected)}
            stroke="#ffffff"
            strokeWidth="2"
            filter="url(#glow)"
            style={{ cursor: "pointer" }}
            onClick={() => handleAtomClick(atom.id)}
            onMouseEnter={() => handleAtomMouseEnter(atom.id)}
            onMouseLeave={handleAtomMouseLeave}
          />
          <text
            x={atom.x}
            y={atom.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="bold"
            style={{ pointerEvents: "none" }}
          >
            {atom.element}
          </text>
        </g>
      );
    });
  }, [atoms, hoveredAtom, selectedAtom, getElementColor, handleAtomClick, handleAtomMouseEnter, handleAtomMouseLeave]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-800 rounded-lg p-8">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <p className="text-gray-300 mb-2">Structure rendering unavailable</p>
          <p className="text-gray-500 text-sm font-mono">{smiles}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={resetView}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            Reset View
          </button>
          <span className="text-gray-300 text-sm">
            Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>
        <div className="text-gray-400 text-sm">
          {selectedAtom !== null && (
            <span>Selected: {atoms[selectedAtom]?.element}</span>
          )}
        </div>
      </div>

      {/* Interactive SVG */}
      <div className="relative overflow-hidden rounded-lg border border-gray-600">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="mx-auto"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Transform group for zoom and pan */}
          <g
            transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          >
            {/* Render bonds first (behind atoms) */}
            {renderBonds}
            
            {/* Render atoms on top */}
            {renderAtoms}
          </g>
        </svg>

        {/* Instructions overlay */}
        <div className="absolute bottom-2 left-2 text-gray-400 text-xs">
          <p>Click atoms to select • Scroll to zoom • Drag to pan</p>
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-gray-400 text-sm">Interactive Structure</p>
        <p className="text-gray-500 text-xs font-mono">{smiles}</p>
      </div>
    </div>
  );
};

export default InteractiveMoleculeRenderer; 