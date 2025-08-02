# CSV-Based Explanation System

## Problem

Multiple frontend components were continuously polling the SHAP and LIME status endpoints (`/shap_status` and `/lime_status`), causing unnecessary backend load and delays.

## Solution

Implemented a CSV-based system where explanation data is saved to CSV files (like `predictions.csv`) and fetched from dedicated endpoints, eliminating the need for continuous polling.

## Changes Made

### Backend Changes (`Model/src/Transformer_model/app.py`)

#### 1. SHAP Function Updates

- **Modified `explain_shap_as_json()`**: Now saves SHAP data to `shap_data.csv`
- **New endpoint `/api/shap_data`**: Fetches SHAP data from CSV file
- **Data structure**:
  ```csv
  sample_index, Predicted_pIC50, Predicted_logP, Predicted_num_atoms, base_value
  0, 0.123, -0.456, 0.789, 0.234
  1, 0.234, -0.567, 0.890, 0.234
  ```

#### 2. LIME Function Updates

- **Modified `explain_lime_as_json()`**: Now saves LIME data to `lime_data.csv`
- **New endpoint `/api/lime_data`**: Fetches LIME data from CSV file
- **Data structure**:
  ```csv
  feature, weight, sample_index, base_value
  Predicted_pIC50, 0.123, 0, 0.234
  Predicted_logP, -0.456, 0, 0.234
  Predicted_num_atoms, 0.789, 0, 0.234
  ```

### Frontend Changes

#### 1. `ShapExplanationChart.tsx`

- **Removed**: Continuous polling of `/shap_status`
- **Added**: Single fetch from `/api/shap_data`
- **Benefits**: No more background polling, immediate data access

#### 2. `LimeCharts.tsx`

- **Removed**: Continuous polling of `/lime_status`
- **Added**: Single fetch from `/api/lime_data`
- **Benefits**: No more background polling, immediate data access

#### 3. `ChatComponent.tsx`

- **Updated**: Both SHAP and LIME data fetching to use new CSV endpoints
- **Removed**: Status polling logic
- **Added**: Direct data fetching from CSV-based endpoints

## API Endpoints

### New Endpoints

1. **`GET /api/shap_data`**

   - Returns SHAP explanation data from `shap_data.csv`
   - Response: `{features, shap_values, base_values, sample_count}`

2. **`GET /api/lime_data`**
   - Returns LIME explanation data from `lime_data.csv`
   - Response: `{feature_names, weights, base_value, sample_count}`

### Legacy Endpoints (Still Available)

- `GET /shap_status` - For backward compatibility
- `GET /lime_status` - For backward compatibility

## Benefits

### 1. Performance

- **Eliminated continuous polling**: No more background requests every 5 seconds
- **Reduced server load**: Fewer API calls to status endpoints
- **Faster data access**: Direct CSV file access instead of status checking

### 2. Reliability

- **Persistent data**: Explanation data is saved to CSV files
- **No data loss**: Data persists between server restarts
- **Consistent format**: CSV format is human-readable and debuggable

### 3. Scalability

- **Reduced network traffic**: No more polling loops
- **Better resource utilization**: Server resources not wasted on status checks
- **Easier debugging**: CSV files can be inspected directly

## File Structure

```
Model/src/Transformer_model/uploads/
├── predictions.csv          # Model predictions
├── shap_data.csv           # SHAP explanation data
└── lime_data.csv           # LIME explanation data
```

## Usage Flow

### Before (Polling System)

1. Frontend calls `/start_shap_explanation`
2. Frontend polls `/shap_status` every 5 seconds
3. When status is "completed", frontend processes data
4. Multiple components poll simultaneously

### After (CSV System)

1. Frontend calls `/start_shap_explanation`
2. Backend processes and saves to `shap_data.csv`
3. Frontend fetches from `/api/shap_data` once
4. Data is immediately available to all components

## Error Handling

- **Missing CSV files**: Return 404 with descriptive error message
- **Invalid data format**: Return 500 with error details
- **Frontend fallback**: Graceful error handling in components

## Migration Notes

- **Backward compatibility**: Old status endpoints still work
- **Gradual migration**: Components can be updated one by one
- **No breaking changes**: Existing functionality preserved

## Testing

To test the new system:

1. Upload a dataset and run predictions
2. Trigger SHAP/LIME explanations
3. Check that CSV files are created in `uploads/` directory
4. Verify frontend components load data correctly
5. Confirm no more continuous polling in browser network tab

The CSV-based system provides a more efficient, reliable, and scalable approach to explanation data management.
