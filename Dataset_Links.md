# Dataset Links and Availability

## ChEMBL Database

- **Official Website:** https://www.ebi.ac.uk/chembl/
- **Release 30:** https://www.ebi.ac.uk/chembl/downloads
- **Access:** Requires free registration at https://www.ebi.ac.uk/chembl/registration
- **Citation:** Gaulton, A., et al. (2012). ChEMBL: a large-scale bioactivity database for drug discovery. Nucleic Acids Research, 40(D1), D1100-D1107. DOI: 10.1093/nar/gkr777
- **Data Download Instructions:**
  1. Register for a free ChEMBL account
  2. Navigate to Downloads section
  3. Select ChEMBL 30 release
  4. Download activity data for human protein targets
  5. Apply filters as specified in the paper (BAO:0000006, BAO:0000015, confidence ≥ 8)

## MOSES Benchmark Dataset

- **Official Repository:** https://github.com/molecularsets/moses
- **Paper:** Polykovskiy, D., et al. (2018). Molecular Sets (MOSES): A benchmarking platform for molecular generation models. arXiv:1811.12823. DOI: 10.48550/arXiv.1811.12823
- **Direct Download:** https://github.com/molecularsets/moses/tree/master/data/dataset_v1.csv
- **Test Set:** Standard MOSES test split (1,000 compounds) available in the repository
- **Note:** MOSES dataset does not contain experimental pIC50 values. Properties (logP, molecular weight, atom count) were computed using RDKit 2022.03.2

## ZINC Database

- **Official Website:** https://zinc.docking.org/
- **Citation:** Irwin, J. J., & Shoichet, B. K. (2005). ZINC - a free database of commercially available compounds for virtual screening. Journal of Chemical Information and Modeling, 45(1), 177-182. DOI: 10.1021/ci049714+
- **Used for:** ChemBERTa pretraining (77 million SMILES strings)
- **Access:** Publicly available, no registration required

## RDKit

- **Official Website:** https://www.rdkit.org/
- **Version Used:** RDKit 2022.03.2
- **Installation:** `pip install rdkit==2022.03.2`
- **Documentation:** https://www.rdkit.org/docs/
- **Descriptor Functions Used:**
  - Molecular Weight: `rdkit.Chem.Descriptors.MolWt()`
  - Hydrogen Bond Donors: `rdkit.Chem.Descriptors.NumHDonors()`
  - Hydrogen Bond Acceptors: `rdkit.Chem.Descriptors.NumHAcceptors()`
  - LogP: `rdkit.Chem.Descriptors.MolLogP()` (Wildman-Crippen method)

## Processed Datasets

- **Processed ChEMBL dataset and preprocessing scripts available at:**
  - GitHub Repository: https://github.com/Yassa122/MoleculeX-Predictive
  - Location: `data/processed/chembl_processed.csv`
  - Preprocessing Script: `scripts/preprocess_chembl.py`

- **Processed MOSES test set:**
  - Location: `data/processed/moses_test.csv`
  - Processing Script: `scripts/preprocess_moses.py`

## Data Availability Statement

All datasets used in this study are publicly available. The ChEMBL database requires free registration. The MOSES benchmark is available under an open-source license. Processed datasets and preprocessing scripts are provided in the GitHub repository to ensure full reproducibility. The code repository includes detailed instructions for downloading and processing the raw data.


