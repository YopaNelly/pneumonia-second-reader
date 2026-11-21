"""
Standalone prediction test — runs the model against image files and prints
the raw probability plus the label. Used to verify the preprocessing matches
training before we expose the model via FastAPI.
"""
import sys
import keras
import tensorflow as tf
import numpy as np
from PIL import Image


@keras.saving.register_keras_serializable(package="week7", name="ResNetPreprocess")
class ResNetPreprocess(keras.layers.Layer):
    def call(self, inputs):
        return keras.applications.resnet50.preprocess_input(inputs * 255.0)
    def compute_output_shape(self, input_shape):
        return input_shape


THRESHOLD = 0.50
IMG_SIZE = (224, 224)


def load_model():
    return keras.models.load_model(
        "./model/resnet50_finetuned.h5",
        compile=False,
        custom_objects={"ResNetPreprocess": ResNetPreprocess},
    )


def predict(model, image_path):
    img = Image.open(image_path).convert("RGB").resize(IMG_SIZE, Image.BILINEAR)
    arr = np.expand_dims(np.array(img, dtype=np.float32) / 255.0, axis=0)
    prob = float(model.predict(arr, verbose=0)[0][0])
    label = "PNEUMONIA" if prob >= THRESHOLD else "NORMAL"
    confidence = prob if label == "PNEUMONIA" else 1 - prob
    return prob, label, confidence


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_predict.py <image_path> [<image_path> ...]")
        sys.exit(1)

    print("Loading model...")
    model = load_model()
    print("Model loaded.\n")

    correct = 0
    total = 0
    for path in sys.argv[1:]:
        try:
            prob, label, confidence = predict(model, path)
            gt = "PNEUMONIA" if "PNEUMONIA_" in path else ("NORMAL" if "NORMAL_" in path else None)
            match = "OK " if gt == label else "XX " if gt else "   "
            if gt:
                total += 1
                if gt == label:
                    correct += 1
            print(f"{match} {path.split('/')[-1]}")
            print(f"    P(PNEUMONIA)={prob:.4f}  ->  {label}  (conf {confidence:.1%})  [truth: {gt}]")
        except Exception as e:
            print(f"ERROR {path}: {e}")

    if total:
        print(f"\nSummary: {correct}/{total} correct ({correct/total:.1%})")
