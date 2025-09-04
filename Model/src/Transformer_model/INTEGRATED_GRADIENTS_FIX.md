# Integrated Gradients Fix

## Problem

The integrated gradients functionality was failing with a `RuntimeError: The size of tensor a (100) must match the size of tensor b (2) at non-singleton dimension 0` error. This was occurring in the `scaled_dot_product_attention` function during the integrated gradients computation.

## Root Cause

The issue was in the `wrapper_forward` function inside `compute_integrated_gradients_embedding`. The function was not properly handling batch size mismatches between:

- The `embeds` tensor passed by Captum's IntegratedGradients
- The `knowledge_features` tensor from the outer scope
- The `attention_mask` tensor from the outer scope

## Solution

The following fixes were implemented:

### 1. Enhanced `wrapper_forward` function

- Added batch size validation and correction
- Ensures all tensors have matching batch sizes before processing
- Handles both single-sample and multi-sample scenarios
- Added comprehensive logging for debugging

### 2. Improved input validation

- Added validation for SMILES input
- Added checks for model and tokenizer availability
- Added batch size consistency checks
- Added proper error handling and logging

### 3. Enhanced error handling

- Added try-catch blocks around critical operations
- Added detailed logging for debugging
- Added graceful error recovery
- Added model status endpoint for health checks

### 4. Added model status endpoint

- New `/api/model_status` endpoint to verify model loading
- Tests model functionality with a simple SMILES
- Provides detailed status information

## Key Changes Made

### In `compute_integrated_gradients_embedding`:

```python
def wrapper_forward(embeds):
    # Ensure embeds has the correct batch size
    batch_size = embeds.shape[0]

    # Ensure knowledge_features matches the batch size of embeds
    if knowledge_features.shape[0] != batch_size:
        if batch_size == 1:
            knowledge_features_batch = knowledge_features[:1]
        else:
            knowledge_features_batch = knowledge_features.repeat(batch_size, 1)
    else:
        knowledge_features_batch = knowledge_features

    # Similar handling for attention_mask
    # ... (similar logic)

    logits = wrapper(
        embedded_inputs=embeds,
        knowledge_features=knowledge_features_batch,
        attention_mask=attention_mask_batch,
    )
    return logits[:, target_idx]
```

### In `integrated_gradients_api`:

```python
# Added input validation
if not smiles_list:
    return jsonify({"error": "No SMILES provided"}), 400

# Added batch size consistency check
if (input_ids.shape[0] != knowledge_feats_tensor.shape[0] or
    input_ids.shape[0] != attention_mask.shape[0]):
    logging.warning("Batch size mismatch detected. Attempting to fix...")
    min_batch_size = min(input_ids.shape[0], knowledge_feats_tensor.shape[0], attention_mask.shape[0])
    input_ids = input_ids[:min_batch_size]
    knowledge_feats_tensor = knowledge_feats_tensor[:min_batch_size]
    attention_mask = attention_mask[:min_batch_size]
```

## Testing

### 1. Start the Flask app:

```bash
cd Model/src/Transformer_model
python app.py
```

### 2. Test the model status:

```bash
curl http://localhost:5000/api/model_status
```

### 3. Test integrated gradients:

```bash
python test_integrated_gradients.py
```

### 4. Manual API test:

```bash
curl -X POST http://localhost:5000/api/integrated-gradients \
  -H "Content-Type: application/json" \
  -d '{"smiles_list": ["CC", "CCC"], "target_idx": 0}'
```

## Expected Behavior

- The model should load successfully on startup
- The `/api/model_status` endpoint should return `{"status": "ready", "model_available": true}`
- The integrated gradients endpoint should process SMILES without tensor dimension errors
- Comprehensive logging should help debug any remaining issues

## Troubleshooting

1. **Model not loading**: Check if the model files exist in `./fine_tuned_chemberta_with_knowledge/`
2. **CUDA errors**: The model will automatically fall back to CPU if CUDA is not available
3. **Memory issues**: Try processing fewer SMILES at once
4. **Tokenization errors**: Ensure SMILES are valid chemical structures

## Performance Notes

- The fix adds some overhead for batch size validation
- Processing time may increase slightly due to additional checks
- Memory usage remains the same
- The fix is backward compatible with existing API calls
