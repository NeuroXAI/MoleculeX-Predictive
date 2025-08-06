#!/usr/bin/env python3
"""
Test script to verify SHAP computation lock functionality.
This script simulates multiple concurrent requests to test the lock mechanism.
"""

import requests
import time
import threading
from concurrent.futures import ThreadPoolExecutor
import json

# Configuration
BASE_URL = "http://localhost:5000"  # Adjust if your Flask app runs on a different port


def test_shap_status():
    """Test the SHAP status endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/shap_status")
        print(f"SHAP Status Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Status: {data.get('status')}")
            print(f"Is Running: {data.get('is_running')}")
            print(f"Message: {data.get('message')}")
        return response
    except Exception as e:
        print(f"Error testing SHAP status: {e}")
        return None


def test_lime_status():
    """Test the LIME status endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/lime_status")
        print(f"LIME Status Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Status: {data.get('status')}")
            print(f"Is Running: {data.get('is_running')}")
            print(f"Message: {data.get('message')}")
        return response
    except Exception as e:
        print(f"Error testing LIME status: {e}")
        return None


def test_reset_status():
    """Test the reset computation status endpoint"""
    try:
        response = requests.post(f"{BASE_URL}/reset_computation_status")
        print(f"Reset Status Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Reset Message: {data.get('message')}")
        return response
    except Exception as e:
        print(f"Error testing reset status: {e}")
        return None


def simulate_concurrent_requests():
    """Simulate multiple concurrent requests to test the lock mechanism"""
    print("\n=== Testing Concurrent Requests ===")

    def make_request(request_id):
        print(f"Making request {request_id}...")
        response = test_shap_status()
        print(
            f"Request {request_id} completed with status: {response.status_code if response else 'Failed'}"
        )
        return response

    # Test with 5 concurrent requests
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(make_request, i) for i in range(5)]
        results = [future.result() for future in futures]

    print(f"Completed {len(results)} concurrent requests")
    return results


def main():
    """Main test function"""
    print("=== SHAP/LIME Computation Lock Test ===")

    # Test 1: Check initial status
    print("\n1. Testing initial status...")
    test_shap_status()
    test_lime_status()

    # Test 2: Reset status
    print("\n2. Resetting computation status...")
    test_reset_status()

    # Test 3: Check status after reset
    print("\n3. Testing status after reset...")
    test_shap_status()
    test_lime_status()

    # Test 4: Simulate concurrent requests
    print("\n4. Testing concurrent requests...")
    simulate_concurrent_requests()

    print("\n=== Test Complete ===")


if __name__ == "__main__":
    main()
