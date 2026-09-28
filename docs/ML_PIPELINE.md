# ML pipeline

STATUS: NOT STARTED. The 12 ML tables are storage design only. No dataset, training code, model artifacts, evaluation metrics or predictions exist.

Required order: agricultural baseline -> traceable features -> versioned dataset and field/time-aware split -> separate regression and classification models -> real evaluation -> model registry/artifact checksums -> inference and explanations. Calculated or model-derived labels must never be ground truth. Measured labels are reserved for actual observations. Avoid leakage from future weather, duplicate field-days and target-derived input features. Report held-out MAE/RMSE/R2 and classification precision/recall/F1/confusion matrix only after computing them. Explanations describe associations, not proven causal effects.
