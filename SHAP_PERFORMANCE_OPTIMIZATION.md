# SHAP Performance Optimization

## Problem

The SHAP computation was taking an extremely long time (32+ hours) due to inefficient parameter settings in the SHAP KernelExplainer functions.

## Root Cause Analysis

The performance bottleneck was caused by three main factors:

1. **Large sample size**: Processing up to 1000 samples instead of a smaller subset
2. **Large background size**: Using 50 background samples for k-means clustering
3. **High nsamples parameter**: Using 200 samples for SHAP value computation

## Optimizations Applied

### 1. Main SHAP Function (`explain_shap_as_json` in `app.py`)

**Before:**

```python
max_samples = min(1000, len(knowledge_features))  # Up to 1000 samples
background_size = min(50, len(sampled_knowledge_features))  # 50 background samples
shap_values = explainer.shap_values(sampled_knowledge_features, nsamples=200)  # 200 samples
```

**After:**

```python
max_samples = min(100, len(knowledge_features))  # Reduced to 100 samples
background_size = min(10, len(sampled_knowledge_features))  # Reduced to 10 background samples
shap_values = explainer.shap_values(sampled_knowledge_features, nsamples=50)  # Reduced to 50 samples
```

### 2. Biological Activity SHAP Function (`explain_biological_activity_shap` in `app.py`)

**Before:**

```python
background_size = min(50, len(X))  # 50 background samples
shap_values = explainer.shap_values(X, nsamples=100)  # 100 samples
```

**After:**

```python
background_size = min(10, len(X))  # Reduced to 10 background samples
shap_values = explainer.shap_values(X, nsamples=25)  # Reduced to 25 samples
```

## Expected Performance Improvement

The optimizations should reduce computation time by approximately:

- **Sample size reduction**: 1000 → 100 samples = ~10x faster
- **Background size reduction**: 50 → 10 samples = ~5x faster
- **nsamples reduction**: 200 → 50 samples = ~4x faster
- **Overall expected improvement**: ~200x faster (from 32+ hours to ~10-15 minutes)

## Trade-offs

**Accuracy vs Speed:**

- Reduced sample size may affect statistical significance
- Smaller background set may reduce explanation quality
- Fewer nsamples may reduce SHAP value precision

**Recommendations:**

- For production use, consider using the optimized parameters
- For research/development, you can increase parameters for better accuracy
- Monitor the quality of explanations to ensure they remain useful

## Monitoring

To monitor the performance improvement:

1. Check the SHAP status endpoint: `GET /shap_status`
2. Monitor the progress in the terminal output
3. Verify that explanations are still meaningful

## Additional Optimizations (Future)

If further optimization is needed:

1. **Use TreeExplainer** instead of KernelExplainer for tree-based models
2. **Implement caching** for repeated computations
3. **Use GPU acceleration** if available
4. **Implement early stopping** for convergence-based algorithms
5. **Use approximate SHAP** methods for very large datasets

## Files Modified

1. `Model/src/Transformer_model/app.py`
   - `explain_shap_as_json()` function (lines ~553-625)
   - `explain_biological_activity_shap()` function (lines ~2242-2337)

## Testing

To test the optimizations:

1. Restart the Flask application
2. Upload a dataset and run predictions
3. Trigger SHAP explanation
4. Monitor the computation time in the terminal
5. Verify that the results are still meaningful

The optimizations maintain the core functionality while dramatically reducing computation time from hours to minutes.
