# SHAP Computation Lock Fix

## Problem Description

The SHAP endpoint was being called multiple times simultaneously, causing:

- Multiple SHAP computations running in parallel
- Duplicate processing and slow performance
- Resource conflicts and potential crashes
- Unnecessary backend load

## Root Cause

The issue was caused by:

1. **Automatic SHAP start after predictions** - SHAP computation was automatically triggered after each prediction
2. **Manual SHAP requests** - Users could manually trigger SHAP computation via `/explain_predictions` endpoint
3. **Multiple frontend calls** - Frontend components were polling status endpoints frequently
4. **No synchronization** - No mechanism to prevent multiple simultaneous computations

## Solution Implemented

### 1. Added Computation Locks

```python
# Global locks to prevent multiple simultaneous computations
shap_computation_lock = Lock()
shap_is_running = False
lime_computation_lock = Lock()
lime_is_running = False
```

### 2. Updated Background Computation Functions

Both `background_shap_computation()` and `background_lime_computation()` now:

- Check if computation is already running before starting
- Acquire lock before starting computation
- Release lock when computation finishes (in finally block)
- Log lock acquisition and release for debugging

### 3. Enhanced Status Endpoints

Updated `/shap_status` and `/lime_status` endpoints to:

- Include `is_running` flag in response
- Provide better status information to frontend
- Help frontend understand if computation is in progress

### 4. Added Pre-flight Checks

All SHAP/LIME start endpoints now check if computation is already running:

- `/start_shap_explanation`
- `/start_lime_explanation`
- `/explain_predictions`

If computation is already running, they return HTTP 409 (Conflict) with appropriate message.

### 5. Updated Automatic Start Logic

The prediction function now checks if SHAP/LIME are already running before automatically starting them:

```python
# Check if SHAP is already running before starting
with shap_computation_lock:
    if not shap_is_running:
        # Start SHAP computation
    else:
        logging.info("SHAP computation already running, skipping automatic start.")
```

### 6. Added Reset Functionality

Added `/reset_computation_status` endpoint for debugging:

- Manually reset computation flags if needed
- Useful for recovery from stuck states

## Key Benefits

1. **Prevents Duplicate Computations** - Only one SHAP/LIME computation can run at a time
2. **Better Resource Management** - Prevents resource conflicts and crashes
3. **Improved Performance** - Eliminates unnecessary duplicate processing
4. **Better User Experience** - Clear status messages and error handling
5. **Debugging Support** - Enhanced logging and reset functionality

## Testing

Use the provided test script `test_shap_lock.py` to verify the fix:

```bash
python test_shap_lock.py
```

This script will:

- Test status endpoints
- Simulate concurrent requests
- Verify lock mechanism works correctly

## Usage

### Normal Operation

- SHAP/LIME computations will run normally
- Only one computation of each type can run simultaneously
- Status endpoints provide real-time information

### Debugging

If computations get stuck:

```bash
curl -X POST http://localhost:5000/reset_computation_status
```

### Frontend Integration

Frontend should check the `is_running` flag in status responses:

```javascript
if (response.is_running) {
  // Computation is in progress, show appropriate UI
} else {
  // Safe to start new computation
}
```

## Monitoring

The fix includes enhanced logging:

- `"SHAP computation started - lock acquired"`
- `"SHAP computation finished - lock released"`
- `"SHAP computation already running, skipping..."`

Monitor these logs to ensure the lock mechanism is working correctly.
