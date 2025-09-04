"use client";

import React, { useEffect, useState, useRef } from "react";
import { FaExpand, FaCompress, FaRedo, FaDownload, FaExclamationTriangle } from "react-icons/fa";

export default function Viewer3D({ sdf, viewerRef, onError }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewer, setViewer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMounted, setIsMounted] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

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

                // Clear any existing viewer
                if (viewer) {
                    try {
                        viewer.clear();
                    } catch (e) {
                        console.warn("Error clearing viewer:", e);
                    }
                }

                // Wait for 3Dmol to be available
                if (!window.$3Dmol) {
                    await load3DmolScript();
                }

                if (!viewerRef.current) {
                    throw new Error("Viewer container not found");
                }

                // Create viewer with better configuration
                const viewerInstance = window.$3Dmol.createViewer(viewerRef.current, {
                    backgroundColor: "#1f2937",
                    antialias: true,
                    defaultcolors: window.$3Dmol.rasmolElementColors,
                    styles: {
                        stick: { colorscheme: "Jmol" },
                        sphere: { colorscheme: "Jmol" },
                        line: { colorscheme: "Jmol" }
                    }
                });

                // Add the SDF model with error handling
                try {
                    viewerInstance.addModel(sdf, "sdf");
                } catch (modelError) {
                    console.warn("Failed to add SDF model, trying alternative format:", modelError);
                    // Try alternative approach
                    viewerInstance.addModel(sdf, "mol");
                }

                // Set default style
                viewerInstance.setStyle({}, {
                    stick: { colorscheme: "Jmol" },
                    sphere: { colorscheme: "Jmol" }
                });

                // Add surface representation for better visualization
                try {
                    viewerInstance.addSurface(window.$3Dmol.SurfaceType.VDW, {
                        opacity: 0.3,
                        colorscheme: "Jmol"
                    });
                } catch (surfaceError) {
                    console.warn("Surface rendering failed:", surfaceError);
                }

                // Zoom to fit the molecule
                viewerInstance.zoomTo();
                viewerInstance.render();

                setViewer(viewerInstance);
                setIsLoading(false);
                setRetryCount(0); // Reset retry count on success

            } catch (error) {
                console.error("Error initializing Viewer3D:", error);

                if (retryCount < maxRetries) {
                    console.log(`Retrying 3D viewer initialization (${retryCount + 1}/${maxRetries})`);
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => {
                        initializeViewer();
                    }, 1000 * (retryCount + 1)); // Exponential backoff
                } else {
                    setError("Failed to load 3D structure after multiple attempts");
                    setIsLoading(false);
                    if (onError) {
                        onError();
                    }
                }
            }
        };

        const load3DmolScript = () => {
            return new Promise((resolve, reject) => {
                // Check if already loaded
                if (window.$3Dmol) {
                    resolve();
                    return;
                }

                const script = document.createElement("script");
                // Try multiple CDNs for better reliability
                script.src = "https://3dmol.csb.pitt.edu/build/3Dmol-min.js";
                script.async = true;
                script.onload = () => {
                    console.log("3Dmol.js loaded successfully from primary CDN");
                    resolve();
                };
                script.onerror = () => {
                    console.warn("Failed to load 3Dmol.js from primary CDN, trying alternative...");
                    
                    // Try alternative CDN
                    const altScript = document.createElement("script");
                    altScript.src = "https://cdn.jsdelivr.net/npm/3dmol@1.8.0/build/3Dmol-min.js";
                    altScript.async = true;
                    altScript.onload = () => {
                        console.log("3Dmol.js loaded successfully from alternative CDN");
                        resolve();
                    };
                    altScript.onerror = () => {
                        console.error("Failed to load 3Dmol.js from all sources");
                        reject(new Error("Failed to load 3Dmol.js"));
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
                    viewer.clear();
                } catch (e) {
                    console.warn("Error clearing viewer:", e);
                }
            }
        };
    }, [sdf, viewerRef, isMounted, retryCount]);

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
                viewer.zoomTo();
                viewer.render();
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
                    link.download = 'molecule-3d.png';
                    link.href = canvas.toDataURL();
                    link.click();
                }
            } catch (error) {
                console.error("Download error:", error);
            }
        }
    };

    const retryLoading = () => {
        setRetryCount(0);
        setError(null);
        setIsLoading(true);
    };

    // Don't render until mounted to prevent hydration issues
    if (!isMounted) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Loading 3D viewer...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
                <div className="text-center">
                    <FaExclamationTriangle className="text-red-400 text-4xl mb-4 mx-auto" />
                    <p className="text-gray-300 mb-2">3D Structure Unavailable</p>
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
                        <p className="text-gray-300 text-sm">
                            {retryCount > 0 ? `Retrying... (${retryCount}/${maxRetries})` : "Loading 3D structure..."}
                        </p>
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
                <p>Drag to rotate • Scroll to zoom • Right-click for menu</p>
            </div>
        </div>
    );
}
