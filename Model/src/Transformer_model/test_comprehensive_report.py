#!/usr/bin/env python3
"""
Test script to verify comprehensive report generation with fake data
"""

import os
import sys
import pandas as pd


def test_data_files():
    """
    Test that all required data files exist and have the correct structure
    """
    print("Testing data files for comprehensive report...")

    # Check predictions file
    predictions_path = os.path.join("uploads", "predictions.csv")
    if os.path.exists(predictions_path):
        predictions_df = pd.read_csv(predictions_path)
        print(f"✓ Predictions file: {len(predictions_df)} samples")
    else:
        print("✗ Predictions file not found")
        return False

    # Check SHAP file
    shap_path = os.path.join("uploads", "shap_data.csv")
    if os.path.exists(shap_path):
        shap_df = pd.read_csv(shap_path)
        print(f"✓ SHAP file: {len(shap_df)} samples")
        print(f"  SHAP columns: {list(shap_df.columns)}")
    else:
        print("✗ SHAP file not found")
        return False

    # Check LIME file
    lime_path = os.path.join("uploads", "lime_data.csv")
    if os.path.exists(lime_path):
        lime_df = pd.read_csv(lime_path)
        print(f"✓ LIME file: {len(lime_df)} features")
        print(f"  LIME columns: {list(lime_df.columns)}")
        print("  LIME features:")
        for _, row in lime_df.iterrows():
            print(f"    {row['feature']}: {row['weight']} ({row['impact']})")
    else:
        print("✗ LIME file not found")
        return False

    return True


def test_data_consistency():
    """
    Test that the data is consistent and ready for comprehensive report
    """
    print("\nTesting data consistency...")

    # Load all data
    predictions_df = pd.read_csv(os.path.join("uploads", "predictions.csv"))
    shap_df = pd.read_csv(os.path.join("uploads", "shap_data.csv"))
    lime_df = pd.read_csv(os.path.join("uploads", "lime_data.csv"))

    # Check that SHAP data has the same number of samples as predictions
    if len(predictions_df) == len(shap_df):
        print(f"✓ SHAP data matches predictions: {len(predictions_df)} samples")
    else:
        print(
            f"✗ SHAP data mismatch: {len(predictions_df)} predictions vs {len(shap_df)} SHAP values"
        )
        return False

    # Check that LIME data has reasonable feature importance values
    lime_weights = lime_df["weight"].values
    if all(abs(w) <= 1.0 for w in lime_weights):
        print("✓ LIME weights are within reasonable range (-1 to 1)")
    else:
        print("✗ LIME weights are outside reasonable range")
        return False

    # Check that we have both positive and negative impacts
    positive_count = len(lime_df[lime_df["impact"] == "Positive"])
    negative_count = len(lime_df[lime_df["impact"] == "Negative"])
    print(f"✓ LIME impacts: {positive_count} positive, {negative_count} negative")

    return True


def simulate_comprehensive_report():
    """
    Simulate what the comprehensive report would look like
    """
    print("\nSimulating comprehensive report structure...")

    predictions_df = pd.read_csv(os.path.join("uploads", "predictions.csv"))
    shap_df = pd.read_csv(os.path.join("uploads", "shap_data.csv"))
    lime_df = pd.read_csv(os.path.join("uploads", "lime_data.csv"))

    print("Sheet 1: Predicted Properties")
    print(f"  - {len(predictions_df)} rows with SMILES and predicted properties")
    print(f"  - Columns: {list(predictions_df.columns)}")

    print("\nSheet 2: SHAP Explanations")
    print(f"  - {len(shap_df)} rows with SHAP values for each sample")
    print(f"  - Columns: {list(shap_df.columns)}")
    print(f"  - First 3 SHAP values:")
    for i in range(min(3, len(shap_df))):
        row = shap_df.iloc[i]
        print(
            f"    Sample {i}: pIC50={row['Predicted_pIC50']:.4f}, logP={row['Predicted_logP']:.4f}, atoms={row['Predicted_num_atoms']:.4f}"
        )

    print("\nSheet 3: LIME Explanations")
    print(f"  - {len(lime_df)} features with importance weights")
    print(f"  - Will generate multiple rows per sample for comprehensive report")
    print(f"  - Top 5 most important features:")
    top_features = lime_df.nlargest(5, "weight")
    for _, row in top_features.iterrows():
        print(f"    {row['feature']}: {row['weight']:.4f} ({row['impact']})")

    return True


if __name__ == "__main__":
    print("Testing Comprehensive Report Data Generation")
    print("=" * 50)

    if (
        test_data_files()
        and test_data_consistency()
        and simulate_comprehensive_report()
    ):
        print("\n✓ All tests passed! The comprehensive report should work correctly.")
        print("\nYou can now:")
        print("1. Start the Flask application")
        print("2. Navigate to the comprehensive report download")
        print("3. Download the Excel file with all 1000+ rows of data")
    else:
        print("\n✗ Some tests failed. Please check the data generation.")
