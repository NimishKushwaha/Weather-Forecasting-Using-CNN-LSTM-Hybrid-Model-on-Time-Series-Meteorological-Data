import argparse
import json
import os

import numpy as np
import tensorflow as tf
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, Dropout, LSTM, Dense, Input
from tensorflow.keras.optimizers import Adam


def build_model(timesteps: int, num_features: int, targets: int) -> Sequential:
    model = Sequential([
        Input(shape=(timesteps, num_features)),
        Conv1D(64, kernel_size=3, activation='relu', padding='causal'),
        MaxPooling1D(pool_size=2),
        Conv1D(64, kernel_size=3, activation='relu', padding='causal'),
        Dropout(0.2),
        LSTM(64, return_sequences=False),
        Dense(64, activation='relu'),
        Dense(targets)
    ])
    model.compile(optimizer=Adam(1e-3), loss='mse', metrics=['mae'])
    return model


def main() -> None:
    parser = argparse.ArgumentParser(description="Train CNN–LSTM weather forecaster")
    parser.add_argument("--data_dir", default="TS_npy", help="Directory with X_*.npy and y_*.npy")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--batch_size", type=int, default=64)
    parser.add_argument("--model_out", default="forecast_model.keras")
    args = parser.parse_args()

    X_train = np.load(os.path.join(args.data_dir, "X_train.npy"))
    y_train = np.load(os.path.join(args.data_dir, "y_train.npy"))
    X_val = np.load(os.path.join(args.data_dir, "X_val.npy"))
    y_val = np.load(os.path.join(args.data_dir, "y_val.npy"))

    with open(os.path.join(args.data_dir, "meta.json")) as f:
        meta = json.load(f)
    timesteps = int(meta["window"])
    num_features = int(meta["num_features"])
    horizon = int(meta["horizon"])  # targets

    # Defensive reshapes/validations
    def fix_shape(X: np.ndarray) -> np.ndarray:
        if X.ndim == 3:
            return X
        if X.ndim == 2 and X.shape[1] == timesteps:
            # Single-feature case saved as (N, window) -> expand last dim
            return X.reshape(X.shape[0], timesteps, 1)
        if X.ndim == 2 and X.shape[1] == num_features:
            # (N, features) unlikely for windows; attempt to infer window=1
            return X.reshape(X.shape[0], 1, num_features)
        if X.ndim == 1:
            raise ValueError(f"X has shape {X.shape} (1D). This indicates a bad prepare step. Re-run time_series_preparing.py with --features space-separated and correct --datetime_col.")
        raise ValueError(f"Unexpected X shape {X.shape}. Expected (N,{timesteps},{num_features}).")

    X_train = fix_shape(X_train)
    X_val = fix_shape(X_val)

    model = build_model(timesteps, num_features, horizon)
    model.summary()
    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=8, restore_best_weights=True, monitor='val_loss')
    ]
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=args.epochs,
        batch_size=args.batch_size,
        verbose=2,
        callbacks=callbacks,
    )

    model.save(args.model_out)


if __name__ == "__main__":
    main()


