"""
Pneumonia Second Reader — ML inference service.

Wraps the fine-tuned ResNet50 model (threshold 0.50) with Grad-CAM explainability.
The trained .h5 contains a custom registered layer ResNetPreprocess (package week7)
that rescales [0,1] inputs back to [0,255] and applies ResNet50's ImageNet preprocessing.
We re-declare and register that layer here under the same package/name so Keras 3 can
rebuild the saved model.
"""
import os
import io
import base64
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import tensorflow as tf
import keras
import cv2

MODEL_PATH = os.getenv("MODEL_PATH", "./model/resnet50_finetuned.h5")
THRESHOLD = 0.50
IMG_SIZE = (224, 224)


# ------------------------------------------------------------------------------
# The custom layer MUST match the training definition exactly.
# Source: week7/notebooks/02_transfer_learning.ipynb (RESNET_BUILDER_SOURCE)
# ------------------------------------------------------------------------------
@keras.saving.register_keras_serializable(package="week7", name="ResNetPreprocess")
class ResNetPreprocess(keras.layers.Layer):
    """Rescales [0, 1] inputs to [0, 255] and applies ResNet50 preprocessing."""

    def call(self, inputs):
        return keras.applications.resnet50.preprocess_input(inputs * 255.0)

    def compute_output_shape(self, input_shape):
        return input_shape


# ------------------------------------------------------------------------------
# FastAPI app
# ------------------------------------------------------------------------------
app = FastAPI(title="Pneumonia Second Reader API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None


@app.on_event("startup")
def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model not found at {MODEL_PATH}")
    model = keras.models.load_model(
        MODEL_PATH,
        compile=False,
        custom_objects={"ResNetPreprocess": ResNetPreprocess},
    )
    # Warm-up: builds the graph once so the first real request is fast.
    model.predict(np.zeros((1, *IMG_SIZE, 3), dtype="float32"), verbose=0)
    print(f"Model loaded from {MODEL_PATH}")


def preprocess(image_bytes: bytes) -> np.ndarray:
    """
    Convert uploaded bytes to the array the model expects.
    Matches the training pipeline: RGB, bilinear resize, scale to [0, 1].
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE, Image.BILINEAR)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


def make_gradcam(model, img_array, last_conv_layer_name="conv5_block3_out"):
    """Grad-CAM for the nested ResNet50, Keras 3 safe.

    Strategy: build the gradient model from the base sub-model's own input
    to the conv layer's output. Both tensors belong to the same Functional
    graph, so tf.GradientTape can trace from loss back to conv_outputs.
    We then feed the preprocessed array through this base-only grad model,
    and separately run the head layers to get the final class score.
    """
    preproc = next((l for l in model.layers if l.name == "resnet_preprocess"), None)
    base = next((l for l in model.layers if l.name == "resnet50"), None)
    if preproc is None or base is None:
        raise RuntimeError("Required layers 'resnet_preprocess' or 'resnet50' not found.")

    conv_layer = base.get_layer(last_conv_layer_name)

    # Build the grad model entirely inside the base sub-model's graph
    grad_model = keras.Model(
        inputs=base.input,
        outputs=[conv_layer.output, base.output],
    )

    # Preprocess the input array the same way the model does internally
    x_pre = preproc(img_array)  # shape (1, 224, 224, 3), symbolic through ResNetPreprocess

    with tf.GradientTape() as tape:
        x_pre_watched = tf.Variable(x_pre, trainable=True)
        tape.watch(x_pre_watched)
        conv_outputs, base_out = grad_model(x_pre_watched)
        # Run the outer head layers on base_out to get the final probability
        h = base_out
        for layer in model.layers:
            if layer.name in ("input_0_1_scaled", "resnet_preprocess", "resnet50"):
                continue
            h = layer(h, training=False)
        loss = h[:, 0]

    grads = tape.gradient(loss, conv_outputs)
    if grads is None:
        raise RuntimeError("Gradient is None — graph tracing failed.")

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
    heatmap = heatmap.numpy()

    img = (img_array[0].mean(axis=-1) * 255).astype(np.uint8)
    img = cv2.resize(img, IMG_SIZE)
    heatmap_resized = cv2.resize(heatmap, IMG_SIZE)
    heatmap_color = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(cv2.cvtColor(img, cv2.COLOR_GRAY2BGR), 0.6, heatmap_color, 0.4, 0)

    _, buffer = cv2.imencode(".png", overlay)
    return base64.b64encode(buffer).decode("utf-8")


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None, "threshold": THRESHOLD}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    try:
        contents = await file.read()
        img_array = preprocess(contents)
        prob = float(model.predict(img_array, verbose=0)[0][0])
        label = "PNEUMONIA" if prob >= THRESHOLD else "NORMAL"
        confidence = prob if label == "PNEUMONIA" else 1 - prob
        gradcam_b64 = make_gradcam(model, img_array)
        return {
            "label": label,
            "probability": round(prob, 4),
            "confidence": round(confidence, 4),
            "threshold": THRESHOLD,
            "gradcam_base64": gradcam_b64,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
    