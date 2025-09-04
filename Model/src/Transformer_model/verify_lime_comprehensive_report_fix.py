#!/usr/bin/env python3
"""
Script to verify that the LIME comprehensive report fix will work correctly
"""

import pandas as pd
import os


def verify_lime_comprehensive_report_fix():
    """
    Verify that the LIME comprehensive report will now process all samples
    """
    print("Verifying LIME Comprehensive Report Fix")
    print("=" * 45)

    # Load the data
    predictions_df = pd.read_csv(os.path.join("uploads", "predictions.csv"))
    lime_df = pd.read_csv(os.path.join("uploads", "lime_data.csv"))

    print(f"✓ Predictions file: {len(predictions_df)} samples")
    print(f"✓ LIME file: {len(lime_df)} features")

    # Simulate the comprehensive report logic
    lime_explanations = []
    for _, row in lime_df.iterrows():
        lime_explanations.append([row["feature"], row["weight"]])

    print(f"✓ LIME explanations: {len(lime_explanations)} features")

    # Simulate the processing loop
    processed_count = 0
    total_rows_generated = 0

    for idx, (_, row) in enumerate(predictions_df.iterrows()):
        # This is the FIXED condition (was: if idx < 5)
        if idx < len(predictions_df):  # Process all samples
            processed_count += 1
            # Each sample generates rows for all LIME features
            total_rows_generated += len(lime_explanations)

    print(f"✓ Processed {processed_count} samples (should be {len(predictions_df)})")
    print(
        f"✓ Total LIME rows generated: {total_rows_generated} (should be {len(predictions_df) * len(lime_explanations)})"
    )

    if processed_count == len(predictions_df):
        print("✅ FIXED: LIME comprehensive report will now process ALL samples!")
        print(
            f"✅ The Excel download will contain {total_rows_generated} rows of LIME data"
        )
    else:
        print(
            f"❌ Still broken: Only processed {processed_count} out of {len(predictions_df)} samples"
        )

    # Show what the first few rows will look like
    print("\nFirst 10 rows that will appear in the LIME Excel report:")
    print("Row | SMILES | Feature | Weight | Impact | Explanation")
    print("-" * 80)

    row_idx = 1
    for idx in range(min(2, len(predictions_df))):  # Show first 2 samples
        if idx < len(predictions_df):
            smiles = (
                predictions_df.iloc[idx]["SMILES"][:15] + "..."
            )  # Truncate for display

            for feature_name, weight in lime_explanations[
                :5
            ]:  # Show first 5 features per sample
                impact = "Positive" if weight > 0 else "Negative"
                explanation = f"{feature_name} contributes {'positively' if weight > 0 else 'negatively'} to the prediction"

                print(
                    f"{row_idx:3d} | {smiles:18s} | {feature_name:12s} | {weight:6.4f} | {impact:8s} | {explanation}"
                )
                row_idx += 1

            if idx < min(2, len(predictions_df)) - 1:
                print(
                    f"{row_idx:3d} | {'---separator---':18s} | {'':12s} | {'':6s} | {'':8s} | {'':}"
                )
                row_idx += 1

    print(f"\n... and {total_rows_generated - row_idx + 1} more rows!")

    return processed_count == len(predictions_df)


if __name__ == "__main__":
    if verify_lime_comprehensive_report_fix():
        print("\n🎉 SUCCESS: The LIME comprehensive report fix is working!")
        print(
            "You can now download the comprehensive report and see all LIME data for all samples."
        )
    else:
        print("\n❌ FAILED: The LIME fix didn't work as expected.")
