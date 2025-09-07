import argparse
import json
import os

import numpy as np
from tensorflow.keras.models import load_model


def main() -> None:
    parser = argparse.ArgumentParser(description="Predict next 5-day (40×3h) horizons from TS model (autoregressive)")
    parser.add_argument("--data_dir", default="TS_npy")
    parser.add_argument("--model", default="forecast_model.keras")
    parser.add_argument("--out", default="forecast_next.json")
    parser.add_argument("--steps", type=int, default=40, help="Number of 3h steps to predict (40≈5 days)")
    args = parser.parse_args()

    # Load data/meta and model
    X_test = np.load(os.path.join(args.data_dir, "X_test.npy"))
    model = load_model(args.model)

    # Read meta.json to discover target column index if available
    meta_path = os.path.join(args.data_dir, "meta.json")
    target_feature_idx = 0
    try:
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        feature_cols = meta.get("feature_cols") or []
        target_col = meta.get("target_col")
        if feature_cols and target_col in feature_cols:
            target_feature_idx = feature_cols.index(target_col)
    except Exception:
        pass

    # Use the latest window to roll-forward
    window = X_test[-1].copy()  # (timesteps, features)

    preds: list[float] = []
    for _ in range(args.steps):
        yhat = model.predict(np.expand_dims(window, axis=0), verbose=0)
        yhat = float(np.array(yhat).reshape(-1)[0])
        preds.append(yhat)

        # Build next window by shifting and appending a new row.
        # For simplicity, copy last row and replace the target feature with the new prediction.
        new_row = window[-1].copy()
        new_row[target_feature_idx] = yhat
        window = np.vstack([window[1:], new_row])

    out = {"horizon": len(preds), "pred": preds}
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f)
    print(args.out)


if __name__ == "__main__":
    main()


