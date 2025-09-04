"use client";

interface ParsedAtom {
  element: string;
  x: number;
  y: number;
  id: number;
  bonds: number[];
}

interface ParsedBond {
  startAtom: number;
  endAtom: number;
  order: number;
}

export class AdvancedSmilesParser {
  private atoms: ParsedAtom[] = [];
  private bonds: ParsedBond[] = [];
  private currentX = 100;
  private currentY = 100;
  private atomId = 0;

  parse(smiles: string): { atoms: ParsedAtom[]; bonds: ParsedBond[] } {
    this.atoms = [];
    this.bonds = [];
    this.currentX = 100;
    this.currentY = 100;
    this.atomId = 0;

    try {
      this.parseSmiles(smiles);
      return { atoms: this.atoms, bonds: this.bonds };
    } catch (error) {
      console.error("SMILES parsing error:", error);
      // Fallback to simple element extraction
      return this.simpleParse(smiles);
    }
  }

  private parseSmiles(smiles: string) {
    let i = 0;
    const stack: number[] = [];
    let lastAtomId = -1;

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
      x: this.currentX,
      y: this.currentY,
      id: this.atomId,
      bonds: [],
    };

    this.atoms.push(atom);
    this.currentX += 60;

    // Wrap to next row if too wide
    if (this.currentX > 500) {
      this.currentX = 100;
      this.currentY += 60;
    }

    return this.atomId++;
  }

  private addBond(startAtom: number, endAtom: number, order: number) {
    this.bonds.push({ startAtom, endAtom, order });

    // Update atom bond lists
    if (this.atoms[startAtom]) {
      this.atoms[startAtom].bonds.push(endAtom);
    }
    if (this.atoms[endAtom]) {
      this.atoms[endAtom].bonds.push(startAtom);
    }
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
      });

      if (index > 0) {
        bonds.push({
          startAtom: index - 1,
          endAtom: index,
          order: 1,
        });
      }
    });

    return { atoms, bonds };
  }
}
