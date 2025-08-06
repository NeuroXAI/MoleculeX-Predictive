"use client";

import React, { useEffect, useState } from "react";

export default function DebugViewer({ sdf }) {
    const [debugInfo, setDebugInfo] = useState([]);
    const [testResults, setTestResults] = useState({});

    const addDebugInfo = (message) => {
        setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
    };

    useEffect(() => {
        if (!sdf) return;

        addDebugInfo("Starting debug viewer...");
        addDebugInfo(`SDF data length: ${sdf.length}`);
        addDebugInfo(`SDF data preview: ${sdf.substring(0, 200)}...`);

        // Test NGL Viewer
        testNGLViewer();
        
        // Test Three.js
        testThreeJS();
        
        // Test 3Dmol.js
        test3DmolJS();

    }, [sdf]);

    const testNGLViewer = async () => {
        try {
            addDebugInfo("Testing NGL Viewer...");
            
            // Check if NGL is available
            if (typeof window !== 'undefined' && window.NGL) {
                addDebugInfo("NGL is already loaded");
            } else {
                addDebugInfo("NGL not loaded, attempting to load...");
                
                // Try to load NGL
                const script = document.createElement("script");
                script.src = "https://unpkg.com/ngl@0.10.4/dist/ngl.js";
                script.async = true;
                
                await new Promise((resolve, reject) => {
                    script.onload = () => {
                        addDebugInfo("NGL script loaded successfully");
                        resolve();
                    };
                    script.onerror = () => {
                        addDebugInfo("Failed to load NGL script");
                        reject(new Error("NGL load failed"));
                    };
                    document.head.appendChild(script);
                });
            }

            // Test NGL API
            if (window.NGL) {
                addDebugInfo("NGL API available");
                addDebugInfo(`NGL.Stage: ${typeof window.NGL.Stage}`);
                addDebugInfo(`NGL.Structure: ${typeof window.NGL.Structure}`);
                
                // Test creating a stage
                const testDiv = document.createElement('div');
                testDiv.style.width = '100px';
                testDiv.style.height = '100px';
                document.body.appendChild(testDiv);
                
                try {
                    const stage = new window.NGL.Stage(testDiv);
                    addDebugInfo("NGL Stage created successfully");
                    
                    // Test loading structure
                    const blob = new Blob([sdf], { type: "chemical/x-mdl-molfile" });
                    addDebugInfo("Created blob from SDF");
                    
                    const structure = await stage.loadFile(blob, { ext: "sdf" });
                    addDebugInfo(`Structure loaded: ${structure ? structure.length : 0} components`);
                    
                    if (structure && structure.length > 0) {
                        const mol = structure[0];
                        addDebugInfo(`Molecule has addRepresentation: ${typeof mol.addRepresentation}`);
                        
                        if (typeof mol.addRepresentation === 'function') {
                            mol.addRepresentation("ball+stick");
                            addDebugInfo("Representation added successfully");
                        }
                    }
                    
                    stage.dispose();
                    document.body.removeChild(testDiv);
                    
                } catch (error) {
                    addDebugInfo(`NGL test failed: ${error.message}`);
                }
            }
            
        } catch (error) {
            addDebugInfo(`NGL Viewer test failed: ${error.message}`);
        }
    };

    const testThreeJS = async () => {
        try {
            addDebugInfo("Testing Three.js...");
            
            if (typeof window !== 'undefined' && window.THREE) {
                addDebugInfo("Three.js is already loaded");
            } else {
                addDebugInfo("Three.js not loaded, attempting to load...");
                
                const script = document.createElement("script");
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
                script.async = true;
                
                await new Promise((resolve, reject) => {
                    script.onload = () => {
                        addDebugInfo("Three.js script loaded successfully");
                        resolve();
                    };
                    script.onerror = () => {
                        addDebugInfo("Failed to load Three.js script");
                        reject(new Error("Three.js load failed"));
                    };
                    document.head.appendChild(script);
                });
            }

            if (window.THREE) {
                addDebugInfo("Three.js API available");
                addDebugInfo(`THREE.Scene: ${typeof window.THREE.Scene}`);
                addDebugInfo(`THREE.WebGLRenderer: ${typeof window.THREE.WebGLRenderer}`);
                
                // Test creating a scene
                const scene = new window.THREE.Scene();
                addDebugInfo("Three.js Scene created successfully");
                
                // Test parsing SDF
                const lines = sdf.split('\n');
                let atomCount = 0;
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.match(/^\d+\s+\d+/)) {
                        const parts = line.split(/\s+/);
                        if (parts.length >= 2) {
                            atomCount = parseInt(parts[0]);
                            break;
                        }
                    }
                }
                addDebugInfo(`Parsed atom count: ${atomCount}`);
                
            }
            
        } catch (error) {
            addDebugInfo(`Three.js test failed: ${error.message}`);
        }
    };

    const test3DmolJS = async () => {
        try {
            addDebugInfo("Testing 3Dmol.js...");
            
            if (typeof window !== 'undefined' && window.$3Dmol) {
                addDebugInfo("3Dmol.js is already loaded");
            } else {
                addDebugInfo("3Dmol.js not loaded, attempting to load...");
                
                const script = document.createElement("script");
                script.src = "https://3dmol.csb.pitt.edu/build/3Dmol-min.js";
                script.async = true;
                
                await new Promise((resolve, reject) => {
                    script.onload = () => {
                        addDebugInfo("3Dmol.js script loaded successfully");
                        resolve();
                    };
                    script.onerror = () => {
                        addDebugInfo("Failed to load 3Dmol.js script");
                        reject(new Error("3Dmol.js load failed"));
                    };
                    document.head.appendChild(script);
                });
            }

            if (window.$3Dmol) {
                addDebugInfo("3Dmol.js API available");
                addDebugInfo(`$3Dmol.createViewer: ${typeof window.$3Dmol.createViewer}`);
                
                // Test creating a viewer
                const testDiv = document.createElement('div');
                testDiv.style.width = '100px';
                testDiv.style.height = '100px';
                document.body.appendChild(testDiv);
                
                try {
                    const viewer = window.$3Dmol.createViewer(testDiv);
                    addDebugInfo("3Dmol.js viewer created successfully");
                    
                    // Test adding model
                    viewer.addModel(sdf, "sdf");
                    addDebugInfo("3Dmol.js model added successfully");
                    
                    viewer.clear();
                    document.body.removeChild(testDiv);
                    
                } catch (error) {
                    addDebugInfo(`3Dmol.js test failed: ${error.message}`);
                }
            }
            
        } catch (error) {
            addDebugInfo(`3Dmol.js test failed: ${error.message}`);
        }
    };

    return (
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-600">
            <h3 className="text-lg font-semibold text-white mb-4">Debug Information</h3>
            <div className="bg-zinc-800 p-4 rounded border border-zinc-700 max-h-96 overflow-y-auto">
                {debugInfo.map((info, index) => (
                    <div key={index} className="text-xs text-gray-300 mb-1 font-mono">
                        {info}
                    </div>
                ))}
            </div>
        </div>
    );
} 