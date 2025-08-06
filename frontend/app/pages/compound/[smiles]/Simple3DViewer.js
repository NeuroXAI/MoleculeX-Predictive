"use client";

import React, { useEffect, useState, useRef } from "react";
import { FaExpand, FaCompress, FaRedo, FaDownload, FaExclamationTriangle } from "react-icons/fa";

export default function Simple3DViewer({ sdf, viewerRef, onError }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [scene, setScene] = useState(null);
    const [renderer, setRenderer] = useState(null);
    const [camera, setCamera] = useState(null);
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

                console.log("Initializing Simple3DViewer with SDF data length:", sdf.length);

                // Load Three.js if not already loaded
                if (!window.THREE) {
                    console.log("Loading Three.js script...");
                    await loadThreeJSScript();
                } else {
                    console.log("Three.js already loaded");
                }

                if (!viewerRef.current) {
                    throw new Error("Viewer container not found");
                }

                console.log("Creating Three.js scene...");

                // Clear any existing scene
                if (scene) {
                    try {
                        renderer.dispose();
                    } catch (e) {
                        console.warn("Error disposing renderer:", e);
                    }
                }

                // Create Three.js scene
                const newScene = new window.THREE.Scene();
                newScene.background = new window.THREE.Color("#1f2937");

                // Create camera
                const newCamera = new window.THREE.PerspectiveCamera(
                    75,
                    viewerRef.current.clientWidth / viewerRef.current.clientHeight,
                    0.1,
                    1000
                );
                newCamera.position.z = 5;

                // Create renderer
                const newRenderer = new window.THREE.WebGLRenderer({ antialias: true });
                newRenderer.setSize(viewerRef.current.clientWidth, viewerRef.current.clientHeight);
                newRenderer.setClearColor("#1f2937");
                viewerRef.current.innerHTML = '';
                viewerRef.current.appendChild(newRenderer.domElement);

                console.log("Three.js scene created, parsing SDF...");

                // Parse SDF and create molecular representation
                const atoms = parseSDF(sdf);
                console.log("Parsed atoms:", atoms.length);

                if (atoms.length === 0) {
                    throw new Error("No valid atoms found in SDF data");
                }

                // Create atom spheres with proper positioning
                atoms.forEach((atom, index) => {
                    const geometry = new window.THREE.SphereGeometry(0.3, 16, 16);
                    const material = new window.THREE.MeshPhongMaterial({
                        color: getAtomColor(atom.element),
                        shininess: 100
                    });
                    const sphere = new window.THREE.Mesh(geometry, material);

                    // Use actual coordinates from SDF if available, otherwise create a layout
                    if (atom.x !== undefined && atom.y !== undefined && atom.z !== undefined) {
                        sphere.position.set(atom.x, atom.y, atom.z);
                    } else {
                        // Create a circular layout as fallback
                        const angle = (index / atoms.length) * Math.PI * 2;
                        const radius = 2;
                        sphere.position.x = Math.cos(angle) * radius;
                        sphere.position.y = Math.sin(angle) * radius;
                        sphere.position.z = 0;
                    }

                    newScene.add(sphere);
                });

                console.log("Atoms added to scene");

                // Add bonds if available
                const bonds = parseBonds(sdf);
                console.log("Parsed bonds:", bonds.length);
                bonds.forEach(bond => {
                    if (bond.startAtom < atoms.length && bond.endAtom < atoms.length) {
                        const startAtom = atoms[bond.startAtom];
                        const endAtom = atoms[bond.endAtom];

                        const startPos = new window.THREE.Vector3(
                            startAtom.x || 0,
                            startAtom.y || 0,
                            startAtom.z || 0
                        );
                        const endPos = new window.THREE.Vector3(
                            endAtom.x || 0,
                            endAtom.y || 0,
                            endAtom.z || 0
                        );

                        const bondGeometry = new window.THREE.CylinderGeometry(0.05, 0.05, 1, 8);
                        const bondMaterial = new window.THREE.MeshPhongMaterial({ color: 0xcccccc });
                        const bondMesh = new window.THREE.Mesh(bondGeometry, bondMaterial);

                        // Position and orient the bond
                        const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5);
                        bondMesh.position.copy(midPoint);

                        const direction = endPos.clone().sub(startPos);
                        const length = direction.length();
                        bondMesh.scale.set(1, length, 1);

                        bondMesh.lookAt(endPos);
                        bondMesh.rotateX(Math.PI / 2);

                        newScene.add(bondMesh);
                    }
                });

                console.log("Bonds added to scene");

                // Add lighting
                const ambientLight = new window.THREE.AmbientLight(0x404040, 0.6);
                newScene.add(ambientLight);

                const directionalLight = new window.THREE.DirectionalLight(0xffffff, 0.8);
                directionalLight.position.set(1, 1, 1);
                newScene.add(directionalLight);

                // Add point light for better atom visibility
                const pointLight = new window.THREE.PointLight(0xffffff, 0.5, 10);
                pointLight.position.set(0, 0, 5);
                newScene.add(pointLight);

                console.log("Lighting added to scene");

                // Animation loop
                const animate = () => {
                    requestAnimationFrame(animate);
                    newRenderer.render(newScene, newCamera);
                };
                animate();

                setScene(newScene);
                setRenderer(newRenderer);
                setCamera(newCamera);
                setIsLoading(false);
                console.log("Simple3DViewer initialized successfully");

            } catch (error) {
                console.error("Error initializing Simple3DViewer:", error);
                setError("Failed to load 3D structure with simple viewer");
                setIsLoading(false);
                if (onError) {
                    onError();
                }
            }
        };

        const loadThreeJSScript = () => {
            return new Promise((resolve, reject) => {
                if (window.THREE) {
                    resolve();
                    return;
                }

                const script = document.createElement("script");
                // Try multiple CDNs for better reliability
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
                script.async = true;
                script.onload = () => {
                    console.log("Three.js loaded successfully from CDN");
                    resolve();
                };
                script.onerror = () => {
                    console.warn("Failed to load Three.js from CDN, trying alternative...");
                    
                    // Try alternative CDN
                    const altScript = document.createElement("script");
                    altScript.src = "https://unpkg.com/three@0.128.0/build/three.min.js";
                    altScript.async = true;
                    altScript.onload = () => {
                        console.log("Three.js loaded successfully from alternative CDN");
                        resolve();
                    };
                    altScript.onerror = () => {
                        console.error("Failed to load Three.js from all sources");
                        reject(new Error("Failed to load Three.js"));
                    };
                    document.head.appendChild(altScript);
                };
                document.head.appendChild(script);
            });
        };

        const parseSDF = (sdfData) => {
            const atoms = [];
            const lines = sdfData.split('\n');

            // Look for the atom count line (usually line 4 in SDF format)
            let atomCount = 0;
            let bondCount = 0;
            let atomStartLine = 0;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Try to find the counts line (format: "atomCount bondCount ...")
                if (line.match(/^\d+\s+\d+/)) {
                    const parts = line.split(/\s+/);
                    if (parts.length >= 2) {
                        atomCount = parseInt(parts[0]);
                        bondCount = parseInt(parts[1]);
                        atomStartLine = i + 1;
                        break;
                    }
                }
            }

            // If we found the counts, parse atoms from the specified lines
            if (atomCount > 0 && atomStartLine > 0) {
                for (let i = 0; i < atomCount; i++) {
                    const lineIndex = atomStartLine + i;
                    if (lineIndex < lines.length) {
                        const line = lines[lineIndex];
                        const parts = line.split(/\s+/);

                        if (parts.length >= 4) {
                            const x = parseFloat(parts[0]);
                            const y = parseFloat(parts[1]);
                            const z = parseFloat(parts[2]);
                            const element = parts[3];

                            if (!isNaN(x) && !isNaN(y) && !isNaN(z) && element) {
                                atoms.push({ x, y, z, element });
                            }
                        }
                    }
                }
            } else {
                // Fallback: look for atom lines in the entire file
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.trim() && !isNaN(line.substring(0, 10).trim())) {
                        const parts = line.split(/\s+/);
                        if (parts.length >= 4) {
                            const x = parseFloat(parts[0]);
                            const y = parseFloat(parts[1]);
                            const z = parseFloat(parts[2]);
                            const element = parts[3];

                            if (!isNaN(x) && !isNaN(y) && !isNaN(z) && element) {
                                atoms.push({ x, y, z, element });
                            }
                        }
                    }
                }
            }

            // If no atoms found, create a simple representation
            if (atoms.length === 0) {
                atoms.push({ x: 0, y: 0, z: 0, element: 'C' });
            }

            return atoms;
        };

        const parseBonds = (sdfData) => {
            const bonds = [];
            const lines = sdfData.split('\n');

            // Look for bond lines after atom lines
            let inBondSection = false;
            let atomCount = 0;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Find the counts line
                if (line.match(/^\d+\s+\d+/)) {
                    const parts = line.split(/\s+/);
                    if (parts.length >= 2) {
                        atomCount = parseInt(parts[0]);
                        inBondSection = true;
                        continue;
                    }
                }

                // Parse bond lines
                if (inBondSection && line.match(/^\d+\s+\d+\s+\d+/)) {
                    const parts = line.split(/\s+/);
                    if (parts.length >= 3) {
                        const startAtom = parseInt(parts[0]) - 1; // SDF uses 1-based indexing
                        const endAtom = parseInt(parts[1]) - 1;
                        const bondType = parseInt(parts[2]);

                        if (!isNaN(startAtom) && !isNaN(endAtom) && !isNaN(bondType)) {
                            bonds.push({ startAtom, endAtom, type: bondType });
                        }
                    }
                }

                // Stop when we hit the end of bonds section
                if (inBondSection && line === '') {
                    break;
                }
            }

            return bonds;
        };

        const getAtomColor = (element) => {
            const colors = {
                'C': 0x808080, // Gray
                'H': 0xffffff, // White
                'O': 0xff0000, // Red
                'N': 0x0000ff, // Blue
                'S': 0xffff00, // Yellow
                'P': 0xffa500, // Orange
                'F': 0x00ff00, // Green
                'Cl': 0x00ff00, // Green
                'Br': 0x8b4513, // Brown
                'I': 0x800080   // Purple
            };
            return colors[element] || 0xcccccc;
        };

        initializeViewer();

        return () => {
            if (renderer) {
                try {
                    renderer.dispose();
                } catch (e) {
                    console.warn("Error disposing renderer:", e);
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
        if (camera) {
            try {
                camera.position.set(0, 0, 5);
                camera.lookAt(0, 0, 0);
            } catch (error) {
                console.error("Reset view error:", error);
            }
        }
    };

    const downloadStructure = () => {
        if (renderer) {
            try {
                const link = document.createElement('a');
                link.download = 'molecule-3d-simple.png';
                link.href = renderer.domElement.toDataURL();
                link.click();
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
                    <p className="text-gray-400 text-sm">Loading simple 3D viewer...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
                <div className="text-center">
                    <FaExclamationTriangle className="text-red-400 text-4xl mb-4 mx-auto" />
                    <p className="text-gray-300 mb-2">Simple 3D Viewer Unavailable</p>
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
                        <p className="text-gray-300 text-sm">Loading simple 3D structure...</p>
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
                <p>Simple 3D representation using Three.js</p>
            </div>
        </div>
    );
} 