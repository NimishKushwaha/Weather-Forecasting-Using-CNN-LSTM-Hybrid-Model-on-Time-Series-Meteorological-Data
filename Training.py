import os
import subprocess
import sys
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import tensorflow as tf
from keras import regularizers
from keras.layers import Conv2D, MaxPooling2D, Flatten, Dropout, Dense
from keras.models import Sequential
from keras.utils import to_categorical


def main() -> None:
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
        except RuntimeError as e:
            print(e)

    try:
        train_data = np.load("Data_npy/train_data.npy")
        train_label = np.load("Data_npy/train_label.npy")
    except FileNotFoundError:
        print("Data_npy files not found. Running Preparing_data.py to generate them...")
        subprocess.check_call([sys.executable, "Preparing_data.py"])
        train_data = np.load("Data_npy/train_data.npy")
        train_label = np.load("Data_npy/train_label.npy")

    # Normalize and reshape
    train_data = (train_data / 255.0).reshape(train_data.shape[0], 100, 100, 3)
    num_of_classes = 5
    train_label = to_categorical(train_label, num_of_classes)

    # Build model
    model = Sequential()
    model.add(Conv2D(32, kernel_size=(1, 1), input_shape=(100, 100, 3), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Conv2D(32, kernel_size=(5, 5), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Flatten())
    model.add(Dense(100, activation='relu'))
    model.add(Dense(100, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(50, activation='relu'))
    model.add(Dense(num_of_classes, activation='softmax'))

    model.compile(loss='categorical_crossentropy', optimizer='Adam', metrics=['accuracy'])

    history = model.fit(train_data, train_label, epochs=20, verbose=2, batch_size=50)
    model.save("trainedModelE10.h5", overwrite=True)

    # Visualize training curves
    plt.plot(history.history['loss'])
    plt.title('model loss')
    plt.ylabel('loss')
    plt.xlabel('epoch')
    plt.legend(['train', 'test'], loc='upper left')
    plt.savefig('Loss')
    plt.show()

    plt.plot(history.history['accuracy'])
    plt.title('accuracy')
    plt.ylabel('accuracy')
    plt.xlabel('epoch')
    plt.legend(['train', 'test'], loc='upper left')
    plt.savefig('Accuracy')
    plt.show()


if __name__ == "__main__":
    main()

