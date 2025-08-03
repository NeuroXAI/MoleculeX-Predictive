"use client";

import React, { useEffect, useState, useRef } from "react";
import { FaExpand, FaCompress, FaRedo, FaDownload, FaExclamationTriangle } from "react-icons/fa";

export default function Alternative3DViewer({ sdf, viewerRef }) {
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

                // Load NGL Viewer if not already loaded
                if (!window.NGL) {
                    await loadNGLScript();
                }

                if (!viewerRef.current) {
                    throw new Error("Viewer container not found");
                }

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

                // Add the SDF structure using the correct NGL API
                try {
                    // Use the loadFile method instead of creating Structure manually
                    await viewerInstance.loadFile(new Blob([sdf], { type: "chemical/x-mdl-molfile" }), {
                        ext: "sdf"
                    });

                    // Add ball+stick representation
                    viewerInstance.addRepresentation("ball+stick", {
                        color: "element",
                        radius: 0.5
                    });

                    viewerInstance.autoView();
                    setViewer(viewerInstance);
                    setIsLoading(false);

                } catch (modelError) {
                    console.warn("Failed to load SDF, trying alternative approach:", modelError);

                    // Try with different format
                    try {
                        await viewerInstance.loadFile(new Blob([sdf], { type: "chemical/x-mdl-molfile" }), {
                            ext: "mol"
                        });

                        viewerInstance.addRepresentation("ball+stick", {
                            color: "element",
                            radius: 0.5
                        });

                        viewerInstance.autoView();
                        setViewer(viewerInstance);
                        setIsLoading(false);
                    } catch (secondError) {
                        console.error("Both SDF and MOL formats failed:", secondError);
                        throw new Error("Failed to load molecular structure");
                    }
                }

            } catch (error) {
                console.error("Error initializing Alternative3DViewer:", error);
                setError("Failed to load 3D structure with alternative viewer");
                setIsLoading(false);
            }
        };

        const loadNGLScript = () => {
            return new Promise((resolve, reject) => {
                if (window.NGL) {
                    resolve();
                    return;
                }

                const script = document.createElement("script");
                script.src = "https://unpkg.com/ngl@0.10.4/dist/ngl.js";
                script.async = true;
                script.onload = () => {
                    console.log("NGL Viewer loaded successfully");
                    resolve();
                };
                script.onerror = () => {
                    console.error("Failed to load NGL Viewer");
                    reject(new Error("Failed to load NGL Viewer"));
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