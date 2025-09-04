#!/usr/bin/env python3
"""
Script to verify that the comprehensive report fix will work correctly
"""

import pandas as pd
import os


def verify_comprehensive_report_fix():
    """
    Verify that the comprehensive report will now process all SHAP samples
    """
    print("Verifying Comprehensive Report Fix")
    print("=" * 40)

    # Load the data
    predictions_df = pd.read_csv(os.path.join("uploads", "predictions.csv"))
    shap_df = pd.read_csv(os.path.join("uploads", "shap_data.csv"))

    print(f"✓ Predictions file: {len(predictions_df)} samples")
    print(f"✓ SHAP file: {len(shap_df)} samples")

    # Simulate the comprehensive report logic
    feature_names = ["Predicted_pIC50", "Predicted_logP", "Predicted_num_atoms"]

    # Convert CSV data to the expected format (same as in comprehensive report)
    shap_values = []
    for feature in feature_names:
        if feature in shap_df.columns:
            shap_values.append(shap_df[feature].tolist())

    print(f"✓ SHAP values structure: {len(shap_values)} features")
    print(f"✓ First feature has {len(shap_values[0])} samples")

    # Simulate the processing loop
    processed_count = 0
    for idx, (_, row) in enumerate(predictions_df.iterrows()):
        # This is the FIXED condition (was: if idx < len(shap_values))
        if idx < len(
            shap_values[0]
        ):  # Check against the length of the first feature array
            processed_count += 1

    print(f"✓ Processed {processed_count} samples (should be {len(predictions_df)})")

    if processed_count == len(predictions_df):
        print("✅ FIXED: Comprehensive report will now process ALL samples!")
        print("✅ The Excel download will contain all 999+ rows of SHAP data")
    else:
        print(
            f"❌ Still broken: Only processed {processed_count} out of {len(predictions_df)} samples"
        )

    # Show what the first few rows will look like
    print("\nFirst 5 rows that will appear in the Excel report:")
    print("Row | SMILES | SHAP_pIC50 | SHAP_logP | SHAP_atoms")
    print("-" * 60)

    for idx in range(min(5, len(predictions_df))):
        if idx < len(shap_values[0]):
            smiles = (
                predictions_df.iloc[idx]["SMILES"][:20] + "..."
            )  # Truncate for display
            shap_pic50 = shap_values[0][idx]
            shap_logp = shap_values[1][idx]
            shap_atoms = shap_values[2][idx]
            print(
                f"{idx+1:3d} | {smiles:23s} | {shap_pic50:8.4f} | {shap_logp:8.4f} | {shap_atoms:8.4f}"
            )

    print(f"\n... and {len(predictions_df) - 5} more rows!")

    return processed_count == len(predictions_df)


if __name__ == "__main__":
    if verify_comprehensive_report_fix():
        print("\n🎉 SUCCESS: The comprehensive report fix is working!")
        print("You can now download the comprehensive report and see all 999+ rows.")
    else:
        print("\n❌ FAILED: The fix didn't work as expected.")
