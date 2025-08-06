"use client";

interface ParsedAtom {
  element: string;
  x: number;
  y: number;
  id: number;
  bonds: number[];
  neighbors: number[];
  ringSize?: number;
}

interface ParsedBond {
  startAtom: number;
  endAtom: number;
  order: number;
  isRing?: boolean;
}

export class EnhancedSmilesParser {
  private atoms: ParsedAtom[] = [];
  private bonds: ParsedBond[] = [];
  private atomId = 0;
  private ringNumbers: Map<number, number> = new Map();

  parse(smiles: string): { atoms: ParsedAtom[]; bonds: ParsedBond[] } {
    this.atoms = [];
    this.bonds = [];
    this.atomId = 0;
    this.ringNumbers.clear();

    try {
      this.parseSmiles(smiles);
      this.optimizeLayout();
      return { atoms: this.atoms, bonds: this.bonds };
    } catch (error) {
      console.error("SMILES parsing error:", error);
      return this.simpleParse(smiles);
    }
  }

  private parseSmiles(smiles: string) {
    let i = 0;
    const stack: number[] = [];
    let lastAtomId = -1;
    let ringCounter = 1;

    while (i < smiles.length) {
      const char = smiles[i];

      if (this.isElement(char)) {
        const element = this.extractElement(smiles, i);
        const atomId = this.addAtom(element);

        if (lastAtomId >= 0) {
          this.addBond(lastAtomId, atomId, 1);
        }

        lastAtomId = atomId;
        i += element.length;
      } else if (char === "(") {
        stack.push(lastAtomId);
        i++;
      } else if (char === ")") {
        if (stack.length > 0) {
          lastAtomId = stack.pop()!;
        }
        i++;
      } else if (char === "=") {
        if (lastAtomId >= 0 && i + 1 < smiles.length) {
          const nextChar = smiles[i + 1];
          if (this.isElement(nextChar)) {
            const element = this.extractElement(smiles, i + 1);
            const atomId = this.addAtom(element);
            this.addBond(lastAtomId, atomId, 2);
            lastAtomId = atomId;
            i += element.length + 1;
          }
        }
        i++;
      } else if (char === "#") {
        if (lastAtomId >= 0 && i + 1 < smiles.length) {
          const nextChar = smiles[i + 1];
          if (this.isElement(nextChar)) {
            const element = this.extractElement(smiles, i + 1);
            const atomId = this.addAtom(element);
            this.addBond(lastAtomId, atomId, 3);
            lastAtomId = atomId;
            i += element.length + 1;
          }
        }
        i++;
      } else if (/\d/.test(char)) {
        // Handle ring numbers
        const ringNum = parseInt(char);
        if (lastAtomId >= 0) {
          if (this.ringNumbers.has(ringNum)) {
            // Close ring
            const startAtom = this.ringNumbers.get(ringNum)!;
            this.addBond(startAtom, lastAtomId, 1, true);
            this.ringNumbers.delete(ringNum);
          } else {
            // Open ring
            this.ringNumbers.set(ringNum, lastAtomId);
          }
        }
        i++;
      } else {
        i++;
      }
    }
  }

  private isElement(char: string): boolean {
    return /[A-Z]/.test(char);
  }

  private extractElement(smiles: string, start: number): string {
    let element = smiles[start];
    if (start + 1 < smiles.length && /[a-z]/.test(smiles[start + 1])) {
      element += smiles[start + 1];
    }
    return element;
  }

  private addAtom(element: string): number {
    const atom: ParsedAtom = {
      element,
      x: 0, // Will be calculated in optimizeLayout
      y: 0,
      id: this.atomId,
      bonds: [],
      neighbors: [],
    };

    this.atoms.push(atom);
    return this.atomId++;
  }

  private addBond(
    startAtom: number,
    endAtom: number,
    order: number,
    isRing: boolean = false
  ) {
    this.bonds.push({ startAtom, endAtom, order, isRing });

    // Update atom bond lists and neighbors
    if (this.atoms[startAtom]) {
      this.atoms[startAtom].bonds.push(endAtom);
      this.atoms[startAtom].neighbors.push(endAtom);
    }
    if (this.atoms[endAtom]) {
      this.atoms[endAtom].bonds.push(startAtom);
      this.atoms[endAtom].neighbors.push(startAtom);
    }
  }

  private optimizeLayout() {
    if (this.atoms.length === 0) return;

    // Use force-directed layout for better positioning
    this.forceDirectedLayout();

    // Apply ring detection and optimization
    this.detectRings();

    // Center the molecule
    this.centerMolecule();
  }

  private forceDirectedLayout() {
    const iterations = 50;
    const repulsion = 100;
    const attraction = 0.1;

    // Initialize positions in a circle
    const centerX = 300;
    const centerY = 300;
    const radius = Math.min(200, this.atoms.length * 30);

    this.atoms.forEach((atom, index) => {
      const angle = (2 * Math.PI * index) / this.atoms.length;
      atom.x = centerX + radius * Math.cos(angle);
      atom.y = centerY + radius * Math.sin(angle);
    });

    // Force-directed layout iterations
    for (let iter = 0; iter < iterations; iter++) {
      const forces = this.atoms.map(() => ({ x: 0, y: 0 }));

      // Repulsion between all atoms
      for (let i = 0; i < this.atoms.length; i++) {
        for (let j = i + 1; j < this.atoms.length; j++) {
          const dx = this.atoms[j].x - this.atoms[i].x;
          const dy = this.atoms[j].y - this.atoms[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0) {
            const force = repulsion / (distance * distance);
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            forces[i].x -= fx;
            forces[i].y -= fy;
            forces[j].x += fx;
            forces[j].y += fy;
          }
        }
      }

      // Attraction between bonded atoms
      this.bonds.forEach((bond) => {
        const atom1 = this.atoms[bond.startAtom];
        const atom2 = this.atoms[bond.endAtom];

        const dx = atom2.x - atom1.x;
        const dy = atom2.y - atom1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          const force = (distance - 60) * attraction; // Target distance of 60
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          forces[bond.startAtom].x += fx;
          forces[bond.startAtom].y += fy;
          forces[bond.endAtom].x -= fx;
          forces[bond.endAtom].y -= fy;
        }
      });

      // Apply forces
      this.atoms.forEach((atom, index) => {
        atom.x += forces[index].x;
        atom.y += forces[index].y;
      });
    }
  }

  private detectRings() {
    // Simple ring detection using DFS
    const visited = new Set<number>();
    const rings: number[][] = [];

    for (let startAtom = 0; startAtom < this.atoms.length; startAtom++) {
      if (!visited.has(startAtom)) {
        this.findRings(startAtom, -1, visited, [], rings);
      }
    }

    // Mark atoms in rings
    rings.forEach((ring) => {
      ring.forEach((atomId) => {
        if (this.atoms[atomId]) {
          this.atoms[atomId].ringSize = ring.length;
        }
      });
    });
  }

  private findRings(
    current: number,
    parent: number,
    visited: Set<number>,
    path: number[],
    rings: number[][]
  ) {
    if (visited.has(current)) {
      // Found a ring
      const ringStart = path.indexOf(current);
      if (ringStart !== -1) {
        const ring = path.slice(ringStart);
        if (ring.length >= 3) {
          rings.push(ring);
        }
      }
      return;
    }

    visited.add(current);
    path.push(current);

    this.atoms[current].neighbors.forEach((neighbor) => {
      if (neighbor !== parent) {
        this.findRings(neighbor, current, visited, path, rings);
      }
    });

    path.pop();
  }

  private centerMolecule() {
    if (this.atoms.length === 0) return;

    // Calculate bounding box
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    this.atoms.forEach((atom) => {
      minX = Math.min(minX, atom.x);
      maxX = Math.max(maxX, atom.x);
      minY = Math.min(minY, atom.y);
      maxY = Math.max(maxY, atom.y);
    });

    // Center the molecule
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const targetCenterX = 300;
    const targetCenterY = 300;

    this.atoms.forEach((atom) => {
      atom.x += targetCenterX - centerX;
      atom.y += targetCenterY - centerY;
    });
  }

  private simpleParse(smiles: string): {
    atoms: ParsedAtom[];
    bonds: ParsedBond[];
  } {
    const elements = smiles.match(/([A-Z][a-z]?)/g) || [];
    const atoms: ParsedAtom[] = [];
    const bonds: ParsedBond[] = [];

    elements.slice(0, 20).forEach((element, index) => {
      const row = Math.floor(index / 5);
      const col = index % 5;

      atoms.push({
        element,
        x: 100 + col * 80,
        y: 100 + row * 80,
        id: index,
        bonds: [],
        neighbors: [],
      });

      if (index > 0) {
        bonds.push({
          startAtom: index - 1,
          endAtom: index,
          order: 1,
        });

        atoms[index - 1].neighbors.push(index);
        atoms[index].neighbors.push(index - 1);
      }
    });

    return { atoms, bonds };
  }
}
