import tensorflow as tf
import numpy as np
from keras.utils import to_categorical
from keras.models import load_model
def main() -> None:
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
      try:
        for gpu in gpus:
          tf.config.experimental.set_memory_growth(gpu, True)
      except RuntimeError as e:
        print(e)


# In[2]:


## imports moved to top


    # Load test data
    test_data = np.load("Test_data/Matrices/Matricestrain_data.npy")
    test_label = np.load("Test_data/Matrices/Matricestrain_label.npy")


    # Normalize
    test_data = test_data / 255.0


# In[ ]:


    num_of_classes = 5


# In[ ]:


    vd = [ [[], []] for _ in range(5)]
    for i in range(len(test_data)):
        cls = int(test_label[i])
        vd[cls][0].append(test_data[i])
        vd[cls][1].append(cls)
    for i in range(5):
        vd[i][0] = np.array(vd[i][0])
        vd[i][1] = np.array(vd[i][1])


# In[ ]:


    # One-hot encoding
    test_label = to_categorical(test_label, num_of_classes)


    model = load_model("trainedModelE10.h5")


    # Predict using argmax for compatibility with newer TF/Keras
    y = np.argmax(model.predict(test_data, verbose=0), axis=1)


# In[ ]:


    # Convert one-hot to labels
    new_lbl = []
    for i in range(len(test_label)):
        new_lbl.append(np.argmax(test_label[i]))
    class_vec = new_lbl


# ## Calculating General Accuracy

# In[ ]:


    c = 0
    for i in range(len(y)):
        if y[i] == new_lbl[i]:
            c += 1
    acc = c / len(y)
    print("General Accuracy for Test Data is :", acc)


if __name__ == "__main__":
    main()

