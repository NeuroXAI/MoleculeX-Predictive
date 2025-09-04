# CSV-Based Explanation System

## Problem

Multiple frontend components were continuously polling the SHAP and LIME status endpoints (`/shap_status` and `/lime_status`), causing unnecessary backend load and delays. Additionally, SHAP and LIME computations were being triggered multiple times from different endpoints, leading to redundant processing.

## Solution

Implemented a CSV-based system where explanation data is saved to CSV files (like `predictions.csv`) and fetched from dedicated endpoints, eliminating the need for continuous polling. Added intelligent caching to prevent multiple computations.

## Changes Made

### Backend Changes (`Model/src/Transformer_model/app.py`)

#### 1. SHAP Function Updates

- **Modified `explain_shap_as_json()`**: Now checks for existing CSV data first and only computes SHAP if the CSV doesn't exist or is outdated
- **New endpoint `/api/shap_data`**: Fetches SHAP data from CSV file
- **Data structure**:
  ```csv
  sample_index, Predicted_pIC50, Predicted_logP, Predicted_num_atoms, base_value
  0, 0.123, -0.456, 0.789, 0.234
  1, 0.234, -0.567, 0.890, 0.234
  ```

#### 2. LIME Function Updates

- **Modified `explain_lime_as_json()`**: Now checks for existing CSV data first and only computes LIME if the CSV doesn't exist or is outdated
- **New endpoint `/api/lime_data`**: Fetches LIME data from CSV file
- **Data structure**:
  ```csv
  feature, weight, sample_index, base_value
  Predicted_pIC50, 0.123, 0, 0.234
  Predicted_logP, -0.456, 0, 0.234
  Predicted_num_atoms, 0.789, 0, 0.234
  ```

#### 3. Automatic Computation

- **Modified `run_predictions()`**: Automatically triggers SHAP and LIME computation after predictions complete
- **CSV Cleanup**: Clears old explanation CSV files when new predictions start
- **Background Processing**: Both SHAP and LIME run in background threads to avoid blocking

#### 4. Comprehensive Report Optimization

- **Modified `comprehensive_report_status()`**: Now checks CSV files instead of calling SHAP/LIME functions directly
- **Modified `create_comprehensive_excel_report()`**: Uses CSV data instead of calling SHAP/LIME functions directly

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
   - No computation required - just reads from CSV
   - Returns 404 if CSV doesn't exist

2. **`GET /api/lime_data`**

   - Returns LIME explanation data from `lime_data.csv`
   - No computation required - just reads from CSV
   - Returns 404 if CSV doesn't exist

### Modified Endpoints

1. **`POST /explain_predictions`**

   - Now triggers both SHAP and LIME computation
   - Uses existing predictions.csv instead of requiring file upload
   - Runs both explanations in background threads

## Performance Improvements

### Before

- Multiple SHAP computations triggered from different endpoints
- Continuous polling from frontend components
- Redundant processing for same prediction data
- Slow response times due to repeated computations

### After

- Single SHAP/LIME computation per prediction run
- CSV-based caching prevents redundant processing
- No polling - direct data access from CSV
- Automatic computation triggered after predictions
- Immediate data availability for frontend components

## File Structure

```
uploads/
├── predictions.csv          # Main prediction results
├── shap_data.csv           # Cached SHAP explanations
└── lime_data.csv           # Cached LIME explanations
```

## Usage Flow

1. **User uploads data for prediction**
2. **Predictions are computed and saved to `predictions.csv`**
3. **SHAP and LIME automatically computed in background**
4. **Results saved to `shap_data.csv` and `lime_data.csv`**
5. **Frontend components fetch data directly from CSV endpoints**
6. **No more polling or redundant computations**

## Benefits

- **Reduced Server Load**: No more multiple SHAP computations
- **Faster Response Times**: Direct CSV access instead of computation
- **Better User Experience**: Immediate data availability
- **Resource Efficiency**: Single computation per prediction run
- **Scalability**: CSV-based system can handle multiple concurrent users
