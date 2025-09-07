import argparse
import os

import numpy as np
from tensorflow.keras.models import load_model
import matplotlib.pyplot as plt


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate CNN–LSTM forecaster on test set")
    parser.add_argument("--data_dir", default="TS_npy", help="Directory with X_test.npy and y_test.npy")
    parser.add_argument("--model", default="forecast_model.keras", help="Path to saved model")
    parser.add_argument("--plot", action="store_true", help="Plot first sample prediction vs target")
    args = parser.parse_args()

    X_test = np.load(os.path.join(args.data_dir, "X_test.npy"))
    y_test = np.load(os.path.join(args.data_dir, "y_test.npy"))

    model = load_model(args.model)
    preds = model.predict(X_test, verbose=0)

    # MAE per step
    mae = np.mean(np.abs(preds - y_test))
    rmse = np.sqrt(np.mean((preds - y_test) ** 2))
    print(f"Test MAE: {mae:.4f}  RMSE: {rmse:.4f}")

    if args.plot:
        idx = 0
        y_true = y_test[idx].reshape(-1)
        y_pred = preds[idx].reshape(-1)
        plt.plot(y_true, label='true')
        plt.plot(y_pred, label='pred')
        plt.legend()
        plt.title('Forecast vs Truth (first sample)')
        plt.show()


if __name__ == "__main__":
    main()


