"use client";

import React, { useEffect, useState, useRef } from "react";
import { FaExpand, FaCompress, FaRedo, FaDownload, FaExclamationTriangle } from "react-icons/fa";

export default function Alternative3DViewer({ sdf, viewerRef, onError }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewer, setViewer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    // Handle hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || !sdf) {
            return;
        }

        const initializeViewer = async () => {
            try {
                setError(null);
                setIsLoading(true);

                console.log("Initializing Alternative3DViewer with SDF data length:", sdf.length);

                // Load NGL Viewer if not already loaded
                if (!window.NGL) {
                    console.log("Loading NGL script...");
                    await loadNGLScript();
                } else {
                    console.log("NGL already loaded");
                }

                if (!viewerRef.current) {
                    throw new Error("Viewer container not found");
                }

                console.log("Creating NGL Stage...");

                // Clear any existing viewer
                if (viewer) {
                    try {
                        viewer.dispose();
                    } catch (e) {
                        console.warn("Error disposing viewer:", e);
                    }
                }

                // Create NGL viewer
                const viewerInstance = new window.NGL.Stage(viewerRef.current, {
                    backgroundColor: "#1f2937",
                    quality: "medium",
                    antialias: true
                });

                console.log("NGL Stage created successfully");

                // Add the SDF structure using the correct NGL API
                try {
                    // Create a blob from the SDF data
                    const blob = new Blob([sdf], { type: "chemical/x-mdl-molfile" });
                    console.log("Created blob from SDF data");
                    
                    // Load the structure using loadFile method
                    console.log("Loading structure with NGL...");
                    const structure = await viewerInstance.loadFile(blob, { ext: "sdf" });
                    console.log("Structure loaded:", structure);
                    
                    // Add ball+stick representation to the loaded structure
                    if (structure && structure.length > 0) {
                        const mol = structure[0];
                        console.log("Adding representations to molecule...");
                        
                        // Use the correct NGL API for adding representations
                        const repr = mol.addRepresentation("ball+stick", {
                            color: "element",
                            radius: 0.5
                        });
                        console.log("Ball+stick representation added:", repr);
                        
                        // Add surface representation
                        const surfaceRepr = mol.addRepresentation("surface", {
                            opacity: 0.3,
                            color: "element"
                        });
                        console.log("Surface representation added:", surfaceRepr);
                    } else {
                        console.warn("No structure components found");
                    }

                    viewerInstance.autoView();
                    setViewer(viewerInstance);
                    setIsLoading(false);
                    console.log("Alternative3DViewer initialized successfully");

                } catch (modelError) {
                    console.warn("Failed to load SDF, trying alternative approach:", modelError);

                    // Try with different format
                    try {
                        console.log("Trying MOL format...");
                        const blob = new Blob([sdf], { type: "chemical/x-mdl-molfile" });
                        const structure = await viewerInstance.loadFile(blob, { ext: "mol" });
                        console.log("MOL structure loaded:", structure);
                        
                        if (structure && structure.length > 0) {
                            const mol = structure[0];
                            mol.addRepresentation("ball+stick", {
                                color: "element",
                                radius: 0.5
                            });
                            
                            mol.addRepresentation("surface", {
                                opacity: 0.3,
                                color: "element"
                            });
                        }

                        viewerInstance.autoView();
                        setViewer(viewerInstance);
                        setIsLoading(false);
                        console.log("Alternative3DViewer initialized with MOL format");
                    } catch (secondError) {
                        console.error("Both SDF and MOL formats failed:", secondError);
                        
                        // Try with direct structure creation
                        try {
                            console.log("Trying direct structure creation...");
                            
                            // Create a new structure object
                            const structure = new window.NGL.Structure();
                            
                            // Parse the SDF data manually
                            const lines = sdf.split('\n');
                            let atoms = [];
                            let bonds = [];
                            
                            // Parse atom and bond information
                            for (let i = 0; i < lines.length; i++) {
                                const line = lines[i].trim();
                                if (line.match(/^\d+\s+\d+/)) {
                                    const parts = line.split(/\s+/);
                                    if (parts.length >= 2) {
                                        const atomCount = parseInt(parts[0]);
                                        const bondCount = parseInt(parts[1]);
                                        
                                        // Parse atoms
                                        for (let j = 0; j < atomCount; j++) {
                                            const atomLine = lines[i + 1 + j];
                                            const atomParts = atomLine.split(/\s+/);
                                            if (atomParts.length >= 4) {
                                                atoms.push({
                                                    x: parseFloat(atomParts[0]),
                                                    y: parseFloat(atomParts[1]),
                                                    z: parseFloat(atomParts[2]),
                                                    element: atomParts[3]
                                                });
                                            }
                                        }
                                        
                                        // Parse bonds
                                        for (let j = 0; j < bondCount; j++) {
                                            const bondLine = lines[i + 1 + atomCount + j];
                                            const bondParts = bondLine.split(/\s+/);
                                            if (bondParts.length >= 3) {
                                                bonds.push({
                                                    startAtom: parseInt(bondParts[0]) - 1,
                                                    endAtom: parseInt(bondParts[1]) - 1,
                                                    type: parseInt(bondParts[2])
                                                });
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                            
                            // Add atoms to structure
                            atoms.forEach((atom, index) => {
                                structure.addAtom(atom.element, atom.x, atom.y, atom.z);
                            });
                            
                            // Add bonds to structure
                            bonds.forEach(bond => {
                                structure.addBond(bond.startAtom, bond.endAtom, bond.type);
                            });
                            
                            const component = viewerInstance.addComponentFromObject(structure);
                            component.addRepresentation("ball+stick", {
                                color: "element",
                                radius: 0.5
                            });
                            
                            viewerInstance.autoView();
                            setViewer(viewerInstance);
                            setIsLoading(false);
                            console.log("Alternative3DViewer initialized with direct structure");
                        } catch (thirdError) {
                            console.error("All loading methods failed:", thirdError);
                            throw new Error("Failed to load molecular structure");
                        }
                    }
                }

            } catch (error) {
                console.error("Error initializing Alternative3DViewer:", error);
                setError("Failed to load 3D structure with alternative viewer");
                setIsLoading(false);
                if (onError) {
                    onError();
                }
            }
        };

        const loadNGLScript = () => {
            return new Promise((resolve, reject) => {
                if (window.NGL) {
                    resolve();
                    return;
                }

                const script = document.createElement("script");
                // Try multiple CDNs for better reliability
                script.src = "https://cdn.jsdelivr.net/npm/ngl@0.10.4/dist/ngl.js";
                script.async = true;
                script.onload = () => {
                    console.log("NGL Viewer loaded successfully from CDN");
                    resolve();
                };
                script.onerror = () => {
                    console.warn("Failed to load NGL from CDN, trying alternative...");
                    
                    // Try alternative CDN
                    const altScript = document.createElement("script");
                    altScript.src = "https://unpkg.com/ngl@0.10.4/dist/ngl.js";
                    altScript.async = true;
                    altScript.onload = () => {
                        console.log("NGL Viewer loaded successfully from alternative CDN");
                        resolve();
                    };
                    altScript.onerror = () => {
                        console.error("Failed to load NGL Viewer from all sources");
                        reject(new Error("Failed to load NGL Viewer"));
                    };
                    document.head.appendChild(altScript);
                };
                document.head.appendChild(script);
            });
        };

        initializeViewer();

        return () => {
            if (viewer) {
                try {
                    viewer.dispose();
                } catch (e) {
                    console.warn("Error disposing viewer:", e);
                }
            }
        };
    }, [sdf, viewerRef, isMounted]);

    const toggleFullscreen = () => {
        if (!viewerRef.current) return;

        try {
            if (!isFullscreen) {
                if (viewerRef.current.requestFullscreen) {
                    viewerRef.current.requestFullscreen();
                } else if (viewerRef.current.webkitRequestFullscreen) {
                    viewerRef.current.webkitRequestFullscreen();
                } else if (viewerRef.current.msRequestFullscreen) {
                    viewerRef.current.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
            setIsFullscreen(!isFullscreen);
        } catch (error) {
            console.error("Fullscreen error:", error);
        }
    };

    const resetView = () => {
        if (viewer) {
            try {
                viewer.autoView();
            } catch (error) {
                console.error("Reset view error:", error);
            }
        }
    };

    const downloadStructure = () => {
        if (viewer) {
            try {
                const canvas = viewerRef.current.querySelector('canvas');
                if (canvas) {
                    const link = document.createElement('a');
                    link.download = 'molecule-3d-ngl.png';
                    link.href = canvas.toDataURL();
                    link.click();
                }
            } catch (error) {
                console.error("Download error:", error);
            }
        }
    };

    const retryLoading = () => {
        setError(null);
        setIsLoading(true);
    };

    // Don't render until mounted to prevent hydration issues
    if (!isMounted) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Loading alternative 3D viewer...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
                <div className="text-center">
                    <FaExclamationTriangle className="text-red-400 text-4xl mb-4 mx-auto" />
                    <p className="text-gray-300 mb-2">Alternative 3D Viewer Unavailable</p>
                    <p className="text-gray-500 text-sm mb-4">{error}</p>
                    <button
                        onClick={retryLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                        Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full">
            {/* Controls */}
            <div className="absolute top-2 right-2 z-10 flex space-x-2">
                <button
                    onClick={resetView}
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    title="Reset View"
                >
                    <FaRedo className="text-sm" />
                </button>
                <button
                    onClick={downloadStructure}
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    title="Download Structure"
                >
                    <FaDownload className="text-sm" />
                </button>
                <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
                </button>
            </div>

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                        <p className="text-gray-300 text-sm">Loading alternative 3D structure...</p>
                    </div>
                </div>
            )}

            {/* Viewer container */}
            <div
                ref={viewerRef}
                className="w-full h-full rounded-lg overflow-hidden"
                style={{ minHeight: '400px' }}
            />

            {/* Instructions overlay */}
            <div className="absolute bottom-2 left-2 text-gray-400 text-xs">
                <p>Drag to rotate • Scroll to zoom • Right-click for menu (NGL Viewer)</p>
            </div>
        </div>
    );
} 