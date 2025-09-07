import argparse
import os
from typing import List, Tuple

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler


def make_windows(features_arr: np.ndarray, target_arr: np.ndarray, window: int, horizon: int) -> Tuple[np.ndarray, np.ndarray]:
    X, y = [], []
    n = len(features_arr)
    for i in range(n - window - horizon + 1):
        X.append(features_arr[i:i+window])
        y.append(target_arr[i+window:i+window+horizon])
    X = np.array(X)
    y = np.array(y).squeeze()
    return X, y


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare time series data: scale, window, save .npy files")
    parser.add_argument("--csv", required=True, help="Path to input CSV with time series data")
    parser.add_argument("--datetime_col", default=None, help="Name of datetime column (optional)")
    parser.add_argument("--features", nargs="+", required=True, help="Feature column names")
    parser.add_argument("--target", required=True, help="Target column name")
    parser.add_argument("--window", type=int, default=48, help="Input window length (timesteps)")
    parser.add_argument("--horizon", type=int, default=1, help="Forecast horizon (steps)")
    parser.add_argument("--split_ratio", type=float, nargs=2, default=[0.7, 0.15], help="Train and val ratios; rest is test")
    parser.add_argument("--out_dir", default="TS_npy", help="Output directory for npy files")
    args = parser.parse_args()

    df = pd.read_csv(args.csv)
    if args.datetime_col and args.datetime_col in df.columns:
        df[args.datetime_col] = pd.to_datetime(df[args.datetime_col])
        df = df.sort_values(args.datetime_col)

    feature_cols: List[str] = args.features
    target_col: str = args.target

    features = df[feature_cols].to_numpy(dtype=np.float32)
    target = df[target_col].to_numpy(dtype=np.float32)

    n = len(df)
    train_end = int(n * args.split_ratio[0])
    val_end = int(n * (args.split_ratio[0] + args.split_ratio[1]))

    feats_train = features[:train_end]
    feats_val = features[train_end:val_end]
    feats_test = features[val_end:]
    targ_train = target[:train_end]
    targ_val = target[train_end:val_end]
    targ_test = target[val_end:]

    scaler = StandardScaler().fit(feats_train)
    X_train = scaler.transform(feats_train)
    X_val = scaler.transform(feats_val)
    X_test = scaler.transform(feats_test)

    X_train, y_train = make_windows(X_train, targ_train, args.window, args.horizon)
    X_val, y_val = make_windows(X_val, targ_val, args.window, args.horizon)
    X_test, y_test = make_windows(X_test, targ_test, args.window, args.horizon)

    os.makedirs(args.out_dir, exist_ok=True)
    np.save(os.path.join(args.out_dir, "X_train.npy"), X_train)
    np.save(os.path.join(args.out_dir, "y_train.npy"), y_train)
    np.save(os.path.join(args.out_dir, "X_val.npy"), X_val)
    np.save(os.path.join(args.out_dir, "y_val.npy"), y_val)
    np.save(os.path.join(args.out_dir, "X_test.npy"), X_test)
    np.save(os.path.join(args.out_dir, "y_test.npy"), y_test)

    # Save metadata for training
    meta = {
        "window": args.window,
        "horizon": args.horizon,
        "num_features": len(feature_cols),
        "feature_cols": feature_cols,
        "target_col": target_col,
        "split_ratio": [args.split_ratio[0], args.split_ratio[1], 1.0 - sum(args.split_ratio)],
    }
    pd.Series(meta).to_json(os.path.join(args.out_dir, "meta.json"), indent=2)


if __name__ == "__main__":
    main()


