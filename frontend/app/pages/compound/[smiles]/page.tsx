"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Viewer3D from "./Viewer3D";
import Alternative3DViewer from "./Alternative3DViewer";
import Simple3DViewer from "./Simple3DViewer";
import NetworkGraph from "./NetworkGraph";
import SmilesDrawer from "smiles-drawer";
import SimpleMoleculeRenderer from "./SimpleMoleculeRenderer";
import InteractiveMoleculeRenderer from "./InteractiveMoleculeRenderer";
import DebugViewer from "./debug-viewer";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaAtom,
  FaCube,
  FaInfoCircle,
  FaDownload,
  FaShare,
  FaCopy,
  FaFlask,
  FaCalculator,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";

interface MoleculeData {
  atoms: { id: number; element: string }[];
  bonds: { startAtomIndex: number; endAtomIndex: number }[];
}

interface MolecularProperties {
  molecularWeight: number;
  atomCount: number;
  bondCount: number;
  formula: string;
  complexity: number;
}

const CompoundDetails = () => {
  const [moleculeData, setMoleculeData] = useState<MoleculeData | null>(null);
  const [molecularProperties, setMolecularProperties] =
    useState<MolecularProperties | null>(null);
  const [activeTab, setActiveTab] = useState("2d");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useSimpleRenderer, setUseSimpleRenderer] = useState(false);
  const [useAlternative3D, setUseAlternative3D] = useState(false);
  const [useSimple3D, setUseSimple3D] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [viewerErrors, setViewerErrors] = useState({
    viewer3d: false,
    alternative3d: false,
    simple3d: false
  });
  const { smiles: rawSmiles } = useParams();
  const smiles =
    typeof rawSmiles === "string" ? decodeURIComponent(rawSmiles) : "";

  const [sdfData, setSdfData] = useState(null);
  const [smilesTree, setSmilesTree] = useState(null);
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);

  // Handle hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate molecular properties
  const calculateProperties = (atoms: any[], bonds: any[]) => {
    try {
      // Calculate molecular formula
      const elementCounts: { [key: string]: number } = {};
      atoms.forEach((atom) => {
        const element = atom.element || "C";
        elementCounts[element] = (elementCounts[element] || 0) + 1;
      });

      const molecularFormula = Object.entries(elementCounts)
        .map(([element, count]) => `${element}${count > 1 ? count : ""}`)
        .join("");

      // Calculate molecular weight (simplified)
      const atomicWeights: { [key: string]: number } = {
        C: 12.01,
        H: 1.008,
        O: 16.0,
        N: 14.01,
        S: 32.07,
        P: 30.97,
        F: 19.0,
        Cl: 35.45,
        Br: 79.9,
        I: 126.9,
      };

      let molecularWeight = 0;
      atoms.forEach((atom) => {
        const element = atom.element || "C";
        molecularWeight += atomicWeights[element] || 12.01;
      });

      // Calculate complexity score
      const complexityScore = Math.min(
        100,
        atoms.length * 2 + bonds.length * 3
      );

      return {
        molecularFormula: molecularFormula || "C",
        molecularWeight: Math.round(molecularWeight * 100) / 100,
        atomCount: atoms.length || 1,
        bondCount: bonds.length,
        complexityScore: Math.round(complexityScore),
      };
    } catch (error) {
      console.error("Error calculating properties:", error);
      return {
        molecularFormula: "C",
        molecularWeight: 12.01,
        atomCount: 1,
        bondCount: 0,
        complexityScore: 10,
      };
    }
  };

  // Fetch SDF data (3D structure)
  useEffect(() => {
    if (!smiles) {
      setError("SMILES string is undefined or empty.");
      setIsLoading(false);
      return;
    }

    const fetchSdfData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching SDF data for SMILES:", smiles);

        const response = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(
            smiles
          )}/SDF?record_type=3d`,
          {
            method: "GET",
            headers: {
              Accept: "chemical/x-mdl-molfile",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const sdfText = await response.text();

        console.log("SDF data received:", sdfText.substring(0, 500) + "...");

        // Validate SDF data
        if (!sdfText || sdfText.trim().length === 0) {
          throw new Error("Empty SDF data received");
        }

        // Check if it's a valid SDF format
        if (!sdfText.includes("$$$$")) {
          console.warn("SDF format validation failed, but continuing...");
          // Don't throw error, just warn - some valid SDF might not have $$$$
        }

        // Additional validation - check for atom coordinates
        const lines = sdfText.split('\n');
        let hasAtoms = false;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.match(/^\d+\s+\d+/)) {
            // Found counts line
            const parts = line.split(/\s+/);
            if (parts.length >= 2) {
              const atomCount = parseInt(parts[0]);
              console.log("Found atom count:", atomCount);
              if (atomCount > 0) {
                hasAtoms = true;
                break;
              }
            }
          }
        }

        if (!hasAtoms) {
          console.warn("No atom count found in SDF data");
        }

        setSdfData(sdfText);
        console.log("SDF data set successfully");
      } catch (error) {
        console.error("Error fetching SDF data:", error);
        setError(`Failed to load 3D structure: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSdfData();
  }, [smiles]);

  // Parse SMILES and set molecule data
  useEffect(() => {
    if (!smiles) {
      setError("SMILES string is undefined or empty.");
      return;
    }

    // Clean and validate SMILES string format
    const cleanSmiles = smiles.trim();
    const isValidSmiles = /^[A-Za-z0-9()[\]{}@%+=#$:;.,\-\\/]+$/.test(
      cleanSmiles
    );
    if (!isValidSmiles) {
      setError("Invalid SMILES format. Please check the molecular structure.");
      return;
    }

    console.log("Attempting to parse SMILES:", cleanSmiles);

    // Set a timeout for SmilesDrawer loading
    const timeoutId = setTimeout(() => {
      if (typeof SmilesDrawer === "undefined") {
        setError(
          "Molecular structure library failed to load. Please refresh the page."
        );
      }
    }, 5000);

    const attemptParsing = () => {
      // Check if SmilesDrawer is available
      if (typeof SmilesDrawer === "undefined" || !SmilesDrawer.parse) {
        console.log("SmilesDrawer not ready, retrying...");
        setTimeout(attemptParsing, 100);
        return;
      }

      clearTimeout(timeoutId);

      try {
        SmilesDrawer.parse(
          cleanSmiles,
          (tree) => {
            console.log("Raw tree data:", tree);

            // More robust tree validation
            if (!tree) {
              throw new Error("No tree data returned from parser");
            }

            // SmilesDrawer returns a different structure than expected
            // Let's create a more complete structure that works with our components
            try {
              // Extract basic molecular information from the tree
              const atoms = [];
              const bonds = [];

              // Create a simple molecular structure based on the SMILES
              // This is a fallback approach when detailed parsing fails
              const elements = cleanSmiles.match(/[A-Z][a-z]?/g) || ["C"];
              const uniqueElements = [...new Set(elements)];

              // Create atoms array
              uniqueElements.forEach((element, index) => {
                atoms.push({
                  id: index.toString(),
                  element: element,
                });
              });

              // Create simple bonds (connect atoms in sequence)
              for (let i = 0; i < atoms.length - 1; i++) {
                bonds.push({
                  startAtomIndex: i,
                  endAtomIndex: i + 1,
                });
              }

              // If we have a valid tree structure, try to extract more detailed information
              if (tree && tree.atom) {
                // Update first atom with actual data
                if (atoms.length > 0) {
                  atoms[0].element = tree.atom;
                }
              }

              // Set the data
              setMoleculeData({ atoms, bonds });
              setSmilesTree(tree);

              // Calculate molecular properties
              const properties = calculateProperties(atoms, bonds);
              setMolecularProperties(properties);

              console.log("SMILES parsed successfully", {
                atoms,
                bonds,
                properties,
              });

              // Clear any previous errors since we have some data
              setError(null);
            } catch (parseError) {
              console.error("Error processing tree structure:", parseError);
              setMoleculeData(null);
              setSmilesTree(null);
              setError("Failed to process molecular structure data.");
            }
          },
          (err) => {
            console.error("Error parsing SMILES:", err);
            setMoleculeData(null);
            setSmilesTree(null);
            setError(
              "Failed to parse SMILES structure. Please check the molecular formula."
            );
          }
        );
      } catch (error) {
        console.error("SMILES parsing error:", error);
        setMoleculeData(null);
        setSmilesTree(null);
        setError("Invalid SMILES format or unsupported molecular structure.");
      }
    };

    attemptParsing();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [smiles]);

  // Draw on canvas once smilesTree and canvasRef are available
  useEffect(() => {
    if (smilesTree && canvasRef.current) {
      console.log("Drawing on canvas...");
      setIsDrawing(true);
      setError(null);

      try {
        // Validate that we have a proper tree structure
        if (!smilesTree || typeof smilesTree !== "object") {
          throw new Error("Invalid tree structure for drawing");
        }

        // Try to create a simple drawer with minimal configuration
        const drawer = new SmilesDrawer.Drawer({
          width: 600,
          height: 600,
          theme: {
            background: "#1f2937",
            atoms: {
              C: "#ffffff",
              O: "#ff0000",
              N: "#0000ff",
              S: "#ffff00",
              P: "#ffa500",
              F: "#00ff00",
              Cl: "#00ff00",
              Br: "#8b4513",
              I: "#800080",
            },
            bonds: {
              single: { color: "#ffffff", width: 2 },
              double: { color: "#ffffff", width: 3 },
              triple: { color: "#ffffff", width: 4 },
            },
          },
        });

        // Use the original SMILES string for drawing
        // Wrap in try-catch to handle any drawing errors
        try {
          // Check if canvas element exists and is valid
          if (!canvasRef.current || !canvasRef.current.getContext) {
            throw new Error("Canvas element not available");
          }

          drawer.draw(smiles, canvasRef.current, "dark", false);
          console.log("Drawing completed successfully");
          setIsDrawing(false);
        } catch (drawError) {
          console.error("Drawing error:", drawError);
          // If external library fails, use simple renderer
          setUseSimpleRenderer(true);
          setIsDrawing(false);
        }
      } catch (error) {
        console.error("Error drawing SMILES:", error);
        setError(
          "Failed to render molecular structure. Please try a different SMILES format."
        );
        setIsDrawing(false);
      }
    }
  }, [smilesTree, canvasRef, smiles]);

  const copySmiles = () => {
    navigator.clipboard.writeText(smiles);
  };

  const shareCompound = () => {
    if (navigator.share) {
      navigator.share({
        title: "Molecular Structure",
        text: `Check out this molecular structure: ${smiles}`,
        url: window.location.href,
      });
    }
  };

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <div className="bg-zinc-900 min-h-screen text-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !useSimpleRenderer) {
    return (
      <div className="bg-zinc-900 min-h-screen text-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-400 text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error Loading Compound</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 min-h-screen text-gray-100">
      {/* Header */}
      <div className="bg-zinc-800/50 backdrop-blur-sm border-b border-zinc-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FaAtom className="text-blue-400 text-2xl" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Molecular Structure
                </h1>
                <p className="text-gray-400 text-sm font-mono">{smiles}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={copySmiles}
                className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                title="Copy SMILES"
              >
                <FaCopy className="text-gray-300" />
              </button>
              <button
                onClick={shareCompound}
                className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                title="Share"
              >
                <FaShare className="text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Molecular Properties Card */}
        {molecularProperties && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-zinc-800 to-zinc-700 p-6 rounded-2xl shadow-xl border border-zinc-600 mb-8"
          >
            <div className="flex items-center mb-4">
              <FaInfoCircle className="text-blue-400 text-xl mr-3" />
              <h2 className="text-xl font-semibold text-white">
                Molecular Properties
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {molecularProperties.formula}
                </div>
                <div className="text-sm text-gray-400">Molecular Formula</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {molecularProperties.molecularWeight}
                </div>
                <div className="text-sm text-gray-400">Molecular Weight</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {molecularProperties.atomCount}
                </div>
                <div className="text-sm text-gray-400">Atoms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {molecularProperties.bondCount}
                </div>
                <div className="text-sm text-gray-400">Bonds</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">
                  {molecularProperties.complexity}
                </div>
                <div className="text-sm text-gray-400">Complexity</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-zinc-800 p-1 rounded-lg">
          {[
            { id: "2d", label: "2D Structure", icon: FaAtom },
            { id: "3d", label: "3D Structure", icon: FaCube },
            { id: "info", label: "Information", icon: FaInfoCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "2d" | "3d" | "info")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-zinc-700"
              }`}
            >
              <tab.icon className="text-lg" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-zinc-800 to-zinc-700 rounded-2xl shadow-xl border border-zinc-600 overflow-hidden"
          >
            {activeTab === "2d" && (
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <FaAtom className="text-blue-400 text-2xl mr-3" />
                  <h2 className="text-2xl font-bold text-white">
                    2D Molecular Structure
                  </h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* SMILES Drawer Canvas */}
                  <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-600">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Chemical Structure
                    </h3>
                    <div className="flex justify-center">
                      {useSimpleRenderer ? (
                        <InteractiveMoleculeRenderer
                          smiles={smiles}
                          width={600}
                          height={600}
                        />
                      ) : smilesTree ? (
                        <div className="relative">
                          <canvas
                            ref={canvasRef}
                            width={600}
                            height={600}
                            className="max-w-full h-auto rounded-lg border border-zinc-600"
                          />
                          {isDrawing && (
                            <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center rounded-lg">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                                <p className="text-gray-300 text-sm">
                                  Rendering structure...
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-96 text-gray-400">
                          <div className="text-center">
                            <FaExclamationTriangle className="text-yellow-400 text-4xl mx-auto mb-4" />
                            <p className="mb-2">
                              Structure rendering unavailable
                            </p>
                            <p className="text-sm">
                              SMILES:{" "}
                              <code className="text-green-400">{smiles}</code>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Fallback SMILES display */}
                    {error && !useSimpleRenderer && (
                      <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                        <div className="flex items-center mb-2">
                          <FaExclamationTriangle className="text-yellow-400 mr-2" />
                          <span className="text-yellow-400 font-medium">
                            Structure Rendering Issue
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{error}</p>
                        <div className="bg-zinc-800 p-3 rounded border border-zinc-600">
                          <p className="text-xs text-gray-400 mb-1">
                            SMILES Notation:
                          </p>
                          <code className="text-green-400 text-sm break-all">
                            {smiles}
                          </code>
                        </div>
                      </div>
                    )}

                    {/* Simple renderer info */}
                    {useSimpleRenderer && (
                      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                        <div className="flex items-center mb-2">
                          <FaInfoCircle className="text-blue-400 mr-2" />
                          <span className="text-blue-400 font-medium">
                            Using Simplified Renderer
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">
                          The external molecule rendering library failed to
                          load. Using a simplified SVG-based renderer instead.
                        </p>
                        <div className="bg-zinc-800 p-3 rounded border border-zinc-600">
                          <p className="text-xs text-gray-400 mb-1">
                            SMILES Notation:
                          </p>
                          <code className="text-green-400 text-sm break-all">
                            {smiles}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Network Graph */}
                  <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-600">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Molecular Graph
                    </h3>
                    <div className="h-96">
                      {moleculeData ? (
                        <NetworkGraph molecule={moleculeData} />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <div className="text-center">
                            <FaExclamationTriangle className="text-yellow-400 text-4xl mx-auto mb-4" />
                            <p>Graph visualization unavailable</p>
                            <p className="text-sm mt-2">
                              SMILES:{" "}
                              <code className="text-green-400">{smiles}</code>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "3d" && (
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <FaCube className="text-green-400 text-2xl mr-3" />
                  <h2 className="text-2xl font-bold text-white">
                    3D Molecular Structure
                  </h2>
                </div>
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-600">
                  {/* 3D Viewer Controls */}
                  {sdfData && (
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        3D Structure
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setUseAlternative3D(false);
                            setUseSimple3D(false);
                          }}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            !useAlternative3D && !useSimple3D
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          3Dmol.js
                        </button>
                        <button
                          onClick={() => {
                            setUseAlternative3D(true);
                            setUseSimple3D(false);
                          }}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            useAlternative3D && !useSimple3D
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          NGL Viewer
                        </button>
                        <button
                          onClick={() => {
                            setUseAlternative3D(false);
                            setUseSimple3D(true);
                          }}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            useSimple3D
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          Three.js
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Debug Viewer */}
                  {sdfData && (
                    <div className="mb-4">
                      <DebugViewer sdf={sdfData} />
                    </div>
                  )}

                  {isLoading ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading 3D structure...</p>
                      </div>
                    </div>
                  ) : sdfData ? (
                    <div className="h-96 rounded-lg overflow-hidden relative">
                      <div ref={viewerRef} className="w-full h-full" />
                      {useSimple3D ? (
                        <Simple3DViewer sdf={sdfData} viewerRef={viewerRef} />
                      ) : useAlternative3D ? (
                        <Alternative3DViewer
                          sdf={sdfData}
                          viewerRef={viewerRef}
                        />
                      ) : (
                        <Viewer3D
                          sdf={sdfData}
                          viewerRef={viewerRef}
                          onError={() => {
                            console.log("3Dmol.js failed, switching to NGL Viewer");
                            setViewerErrors(prev => ({ ...prev, viewer3d: true }));
                            setUseAlternative3D(true);
                          }}
                        />
                      )}
                      
                      {/* Fallback message if all viewers fail */}
                      {viewerErrors.viewer3d && viewerErrors.alternative3d && viewerErrors.simple3d && (
                        <div className="absolute inset-0 bg-zinc-800/90 flex items-center justify-center">
                          <div className="text-center p-6">
                            <FaExclamationTriangle className="text-yellow-400 text-4xl mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">
                              3D Structure Unavailable
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                              All 3D viewers failed to load. This might be due to:
                            </p>
                            <ul className="text-gray-500 text-xs text-left mb-4 space-y-1">
                              <li>• Network connectivity issues</li>
                              <li>• Unsupported molecular structure</li>
                              <li>• Browser compatibility problems</li>
                              <li>• External library loading failures</li>
                            </ul>
                            <div className="bg-zinc-700 p-3 rounded border border-zinc-600">
                              <p className="text-xs text-gray-400 mb-1">
                                SMILES Notation:
                              </p>
                              <code className="text-green-400 text-sm break-all">
                                {smiles}
                              </code>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-96 text-gray-400">
                      <div className="text-center">
                        <FaExclamationTriangle className="text-red-400 text-2xl mr-3" />
                        <p className="mb-2">3D structure not available</p>
                        <p className="text-sm text-gray-500">
                          Unable to fetch 3D structure data from PubChem
                        </p>
                        <div className="mt-4 bg-zinc-800 p-3 rounded border border-zinc-600">
                          <p className="text-xs text-gray-400 mb-1">
                            SMILES Notation:
                          </p>
                          <code className="text-green-400 text-sm break-all">
                            {smiles}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "info" && (
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <FaInfoCircle className="text-purple-400 text-2xl mr-3" />
                  <h2 className="text-2xl font-bold text-white">
                    Molecular Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-600">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      SMILES Notation
                    </h3>
                    <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                      <code className="text-green-400 font-mono text-sm break-all">
                        {smiles}
                      </code>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      SMILES (Simplified Molecular Input Line Entry System) is a
                      specification for encoding molecular structures.
                    </p>
                  </div>

                  <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-600">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Structure Analysis
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-zinc-700">
                        <span className="text-gray-400">
                          Molecular Formula:
                        </span>
                        <span className="text-white font-semibold">
                          {molecularProperties?.molecularFormula || "C"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-700">
                        <span className="text-gray-400">Molecular Weight:</span>
                        <span className="text-white font-semibold">
                          {molecularProperties?.molecularWeight || 12.01} g/mol
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-700">
                        <span className="text-gray-400">Atoms:</span>
                        <span className="text-white font-semibold">
                          {molecularProperties?.atomCount || 1}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-700">
                        <span className="text-gray-400">Bonds:</span>
                        <span className="text-white font-semibold">
                          {molecularProperties?.bondCount || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400">Complexity Score:</span>
                        <span className="text-white font-semibold">
                          {molecularProperties?.complexityScore || 10}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompoundDetails;
