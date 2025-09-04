"use client";

import React, { useEffect, useState } from "react";
import { AdvancedSmilesParser } from "./AdvancedSmilesParser";

interface SimpleMoleculeRendererProps {
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
}

interface Bond {
  startAtom: number;
  endAtom: number;
  order: number;
}

const SimpleMoleculeRenderer: React.FC<SimpleMoleculeRendererProps> = ({
  smiles,
  width = 400,
  height = 400,
}) => {
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Advanced SMILES parser for better structure rendering
  const parseSmiles = (smilesString: string) => {
    try {
      const parser = new AdvancedSmilesParser();
      const result = parser.parse(smilesString);

      setAtoms(result.atoms);
      setBonds(result.bonds);
      setError(null);
    } catch (err) {
      setError("Failed to parse SMILES structure");
      console.error("SMILES parsing error:", err);
    }
  };

  useEffect(() => {
    if (smiles) {
      parseSmiles(smiles);
    }
  }, [smiles]);

  const getElementColor = (element: string) => {
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
    return colors[element] || "#cccccc";
  };

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
      <svg width={width} height={height} className="mx-auto">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Render bonds */}
        {bonds.map((bond, index) => {
          const startAtom = atoms[bond.startAtom];
          const endAtom = atoms[bond.endAtom];

          if (!startAtom || !endAtom) return null;

          return (
            <line
              key={`bond-${index}`}
              x1={startAtom.x}
              y1={startAtom.y}
              x2={endAtom.x}
              y2={endAtom.y}
              stroke="#ffffff"
              strokeWidth={bond.order * 2}
              strokeLinecap="round"
            />
          );
        })}

        {/* Render atoms */}
        {atoms.map((atom) => (
          <g key={`atom-${atom.id}`}>
            <circle
              cx={atom.x}
              cy={atom.y}
              r="12"
              fill={getElementColor(atom.element)}
              stroke="#ffffff"
              strokeWidth="2"
              filter="url(#glow)"
            />
            <text
              x={atom.x}
              y={atom.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize="10"
              fontWeight="bold"
            >
              {atom.element}
            </text>
          </g>
        ))}
      </svg>

      <div className="text-center mt-4">
        <p className="text-gray-400 text-sm">Simplified Structure</p>
        <p className="text-gray-500 text-xs font-mono">{smiles}</p>
      </div>
    </div>
  );
};

export default SimpleMoleculeRenderer;
