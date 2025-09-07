import os
import cv2


def main() -> None:
    Source = 'Data'          # your existing images root (has subfolders 0..4)
    Target = 'Data_Sliced'   # will be created if missing

    if not os.path.isdir(Source):
        raise FileNotFoundError(f"Expected source folder at: {os.path.abspath(Source)}")

    os.makedirs(Target, exist_ok=True)

    for filename in os.listdir(Source):
        src_class_dir = os.path.join(Source, filename)
        if not os.path.isdir(src_class_dir):
            continue
        dst_class_dir = os.path.join(Target, filename)
        os.makedirs(dst_class_dir, exist_ok=True)

        count = 0
        for file in os.listdir(src_class_dir):
            src_path = os.path.join(src_class_dir, file)
            dst_path = os.path.join(dst_class_dir, file)
            img = cv2.imread(src_path)
            if img is None:
                continue
            cv2.imwrite(dst_path, img)
            count += 1
            if count >= 1000:
                break

    print("------------------Data Sliced------------------")


if __name__ == "__main__":
    main()