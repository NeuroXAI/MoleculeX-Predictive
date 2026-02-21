# Paper Updates Summary

## Completed Updates

### 1. Dataset Transparency (Section 3.1 - Dataset)
✅ Added comprehensive subsection 3.1 "Dataset" with:
- ChEMBL release 30 specifications
- Target selection criteria (human protein targets, assay types, filters)
- Data cleaning steps (deduplication, validation, standardization, outlier removal)
- MOSES dataset clarification (computed properties only, no experimental pIC50)
- RDKit version 2022.03.2 and descriptor computation methods

### 2. Evaluation Protocol
✅ Updated evaluation section with:
- Scaffold-based splitting using Bemis-Murcko scaffolds
- 5-fold cross-validation procedure
- Performance metrics: MAE, RMSE, R² with mean ± SD
- Removed "accuracy" metric for pIC50 (regression task)
- Updated performance table with corrected metrics

### 3. Explainability Consistency
✅ Updated XAI sections:
- Aligned SHAP features with actual model inputs (MolWt, NumHDonors, NumHAcceptors)
- Removed "predicted_*" values from explanation tables
- Updated LIME analysis to focus on model input features
- Added Integrated Gradients baseline justification paragraph in Section 2.4
- Added attribution stability analysis

### 4. Reproducibility
✅ Created:
- Dataset_Links.docx with all dataset links and access information
- Instructions for creating code zip file (see below)

### 5. References
✅ Updated cas-refs.bib:
- Removed placeholder citations (ResearchGate pIC50, Imani et al.)
- Added proper ChEMBL citations with DOIs
- Added MOSES citation with DOI
- Added Bemis-Murcko citation for scaffold-based splitting
- Added DOIs to all XAI method citations (SHAP, LIME, Integrated Gradients)
- Removed unrelated vision transformer references
- Updated RDKit citation with version information

## Files Modified

1. **modified_paper.tex** - Main paper with all updates
2. **cas-refs.bib** - Updated bibliography with proper citations and DOIs
3. **Dataset_Links.docx** - Dataset availability information
4. **Paper_Updates_Summary.md** - This summary document

## Next Steps

### Creating Code Zip File

To create the code zip file without processed datasets:

1. Navigate to the project root directory
2. Create a zip file excluding:
   - `data/processed/` directory (processed datasets)
   - `results/` directory (model checkpoints - optional, can include)
   - `shap_plots/` directory (generated plots)
   - `__pycache__/` directories
   - `.git/` directory
   - Virtual environment directories

**Command (Windows PowerShell):**
```powershell
Compress-Archive -Path Model,frontend,scripts,configs,README.md,requirements.txt -DestinationPath MoleculeX-Predictive-Code.zip -Force
```

**Command (Linux/Mac):**
```bash
zip -r MoleculeX-Predictive-Code.zip Model frontend scripts configs README.md requirements.txt -x "*/data/processed/*" "*/__pycache__/*" "*/results/*" "*/shap_plots/*"
```

### Word Document Note

The `Dataset_Links.docx` file created is a text file. To create a proper Word document:
1. Open the file in Microsoft Word
2. Format as needed
3. Save as proper .docx format

Alternatively, the content is ready to copy-paste into a Word document.

## Key Changes Summary

- **Section 3.1**: New comprehensive Dataset subsection
- **Evaluation Protocol**: Scaffold-based splits, cross-validation, corrected metrics
- **Section 2.4**: Added Integrated Gradients baseline justification
- **XAI Sections**: Aligned features with model inputs, removed predicted_* values
- **References**: All citations now have DOIs and proper archival sources

All changes maintain scientific rigor and improve reproducibility.


