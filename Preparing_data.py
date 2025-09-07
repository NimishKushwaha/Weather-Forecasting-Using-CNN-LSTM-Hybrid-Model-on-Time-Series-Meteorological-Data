#!/usr/bin/env python
# coding: utf-8

# # Pre-processing of the Dataset

# In[ ]:


import os
from PIL import Image
import cv2
import numpy as np
from keras.preprocessing import image as image_utils
import PIL.ImageOps
import random

try:
    RESAMPLE = Image.Resampling.LANCZOS
except AttributeError:
    RESAMPLE = Image.LANCZOS


# In[ ]:


# Path of dataset (kept for reference; actual root used below)
path = "Data"


# ## Cropping sky from the image

# In[ ]:


count = 0
source_root = "Data"  # or "Data_Sliced" if you created that earlier
if not os.path.isdir(source_root):
    raise FileNotFoundError(f"Source folder not found: {os.path.abspath(source_root)}")

for folder in os.listdir(source_root):
    src_dir = os.path.join(source_root, folder)
    if not os.path.isdir(src_dir):
        continue

    dst_dir = os.path.join("Cropped_data", folder)
    os.makedirs(dst_dir, exist_ok=True)

    for file in os.listdir(src_dir):
        count += 1
        image_path = os.path.join(src_dir, file)
        try:
            img = Image.open(image_path)
        except Exception:
            continue

        if img.size[0] >= img.size[1]:
            read_image = cv2.imread(image_path, 50)
            if read_image is None:
                continue
            edges = cv2.Canny(read_image, 150, 300)
            shape = np.shape(edges)
            left = np.sum(edges[0:shape[0] // 2, 0:shape[1] // 2])
            right = np.sum(edges[0:shape[0] // 2, shape[1] // 2:])
            sky_side = 0 if right > left else 1

            base_height = 400
            wpercent = (base_height / float(img.size[1]))
            wsize = int(float(img.size[0]) * float(wpercent))
            img = img.resize((wsize, base_height), resample=RESAMPLE)

            if sky_side == 0:
                img = img.crop((0, 0, base_height, img.size[1]))
            else:
                img = img.crop((img.size[0] - base_height, 0, img.size[0], img.size[1]))
        else:
            base_width = 400
            wpercent = (base_width / float(img.size[0]))
            hsize = int(float(img.size[1]) * float(wpercent))
            img = img.resize((base_width, hsize), resample=RESAMPLE)
            img = img.crop((0, 0, img.size[0], 400))

        destination = os.path.join(dst_dir, file)
        try:
            img.save(destination)
        except Exception:
            continue

print("----------Total no. of images cropped:", count, "----------")


# ## Converting images to matrix

# In[ ]:


## imports moved to top


# In[ ]:


# Path of cropped image
image_root = "Cropped_data/"

# 200 sized model
batch_size_for_models = 2
    
train_data = []
train_label = []
    
classes_dir = os.listdir(image_root)
    
fc = 0
    
for cls in classes_dir:
    counter = 0
    class_list = os.listdir(image_root + cls + "/")
    for imagename in class_list:
        counter +=1
            
        # Converting image to array
        img = image_utils.load_img(image_root + cls + "/" + imagename, target_size = (100,100))
        img = PIL.ImageOps.invert(img)
        img = image_utils.img_to_array(img)
            
        # Appending array to the list
        train_data.append(img)
        train_label.append(int(cls))
    
        # If batch size if completed, Save model
        if counter == batch_size_for_models:
            # Saving our model
            dest = "Data_npy/"
            os.makedirs(dest, exist_ok=True)
            # Image data
            np.save(dest + "train_data" + ".npy", np.array(train_data))
            # Image labels
            np.save(dest + "train_label" + ".npy",np.array(train_label))
             
                
# Add the images which are left
if (len(train_data) != 0):
    os.makedirs(dest, exist_ok=True)
    np.save(dest+ "train_data.npy", np.array(train_data))
    np.save(dest+ "train_label.npy", np.array(train_label))

