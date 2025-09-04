#!/usr/bin/env python3
"""
Test script for integrated gradients functionality.
This script tests the fixed integrated gradients implementation.
"""

import requests
import json
import time


def test_model_status():
    """Test if the model is loaded and working."""
    try:
        response = requests.get("http://localhost:5000/api/model_status")
        print(f"Model Status Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Model Status: {data}")
            return data.get("model_available", False)
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Error testing model status: {e}")
        return False


def test_integrated_gradients():
    """Test the integrated gradients endpoint."""
    test_data = {
        "smiles_list": ["CC", "CCC", "CCCC"],  # Simple test SMILES
        "target_idx": 0,
    }

    try:
        print("Testing integrated gradients...")
        response = requests.post(
            "http://localhost:5000/api/integrated-gradients",
            json=test_data,
            headers={"Content-Type": "application/json"},
        )

        print(f"Response Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print("✅ Integrated gradients test passed!")
            print(f"Number of SMILES processed: {len(data.get('smiles_list', []))}")
            print(f"Attributions shape: {len(data.get('attributions', []))}")
            print(f"Convergence delta: {data.get('convergence_delta', 'N/A')}")
            return True
        else:
            print(f"❌ Integrated gradients test failed!")
            print(f"Error: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Error testing integrated gradients: {e}")
        return False


def main():
    """Main test function."""
    print("🧪 Testing Integrated Gradients Fix")
    print("=" * 50)

    # Test 1: Check if model is loaded
    print("\n1. Testing model status...")
    model_ready = test_model_status()

    if not model_ready:
        print("❌ Model is not ready. Please ensure the Flask app is running.")
        return

    print("✅ Model is ready!")

    # Test 2: Test integrated gradients
    print("\n2. Testing integrated gradients...")
    ig_success = test_integrated_gradients()

    if ig_success:
        print("\n🎉 All tests passed! The integrated gradients fix is working.")
    else:
        print("\n❌ Integrated gradients test failed. Check the logs for details.")


if __name__ == "__main__":
    main()
