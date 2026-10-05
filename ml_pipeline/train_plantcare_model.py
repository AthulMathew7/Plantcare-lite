"""
PlantCare Lite — ML Training Pipeline
=====================================
Stage 1 of the PlantCare Lite mini project.

Run this in Google Colab (Runtime > Change runtime type > GPU).
It takes you from raw PlantVillage images to a quantized .tflite
file ready to drop into the React Native app.

Pipeline stages:
  1. Dataset download & preparation
  2. Data augmentation
  3. MobileNetV2 transfer-learning model
  4. Training (frozen base) + fine-tuning (unfrozen top layers)
  5. Evaluation: accuracy, precision, recall, F1
  6. TFLite conversion with quantization
  7. On-device metrics: inference time, model size

-----------------------------------------------------------------
COLAB SETUP (run this cell first):
    !pip install -q tensorflow tensorflow-hub scikit-learn kagglehub
-----------------------------------------------------------------
"""

import os
import time
import json
import shutil
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers, callbacks
from sklearn.metrics import precision_recall_fscore_support, accuracy_score, confusion_matrix

# ============================================================
# CONFIG — edit this block for your scope (2-3 crops, N diseases)
# ============================================================
CONFIG = {
    "img_size": (224, 224),
    "batch_size": 32,
    "epochs_frozen": 10,      # phase 1: train classifier head only
    "epochs_finetune": 8,     # phase 2: unfreeze top of MobileNetV2
    "learning_rate": 1e-3,
    "finetune_learning_rate": 1e-5,
    "val_split": 0.15,
    "test_split": 0.15,
    "seed": 42,

    # Limit scope for a mini project — e.g. Tomato + Potato + Pepper
    # Set to None to use every class found in the dataset folder.
    "selected_classes": None,
    # Example if you want to restrict manually:
    # "selected_classes": [
    #     "Tomato___Late_blight", "Tomato___healthy",
    #     "Potato___Early_blight", "Potato___healthy",
    #     "Pepper__bell___Bacterial_spot", "Pepper__bell___healthy",
    # ],

    "dataset_dir": "/content/plantvillage/raw",  # after download step
    "output_dir": "/content/plantcare_output",
    "quantization": "dynamic",  # "dynamic" | "float16" | "int8"
}

os.makedirs(CONFIG["output_dir"], exist_ok=True)
tf.random.set_seed(CONFIG["seed"])
np.random.seed(CONFIG["seed"])


# ============================================================
# 1. DATASET DOWNLOAD
# ============================================================
def download_plantvillage():
    """
    Downloads the PlantVillage dataset via kagglehub.
    Requires a Kaggle account + API token uploaded to Colab
    (Settings > kaggle.json), or run:
        from google.colab import files
        files.upload()  # upload kaggle.json
        !mkdir -p ~/.kaggle && cp kaggle.json ~/.kaggle/ && chmod 600 ~/.kaggle/kaggle.json
    """
    import kagglehub
    path = kagglehub.dataset_download("abdallahalidev/plantvillage-dataset")
    print("Dataset downloaded to:", path)
    # kagglehub caches under its own path; point CONFIG at the actual
    # class-folder root (may need one more subfolder depending on version)
    return path


# ============================================================
# 2. DATA LOADING + AUGMENTATION
# ============================================================
def build_datasets(data_dir, config):
    """
    Builds train/val/test tf.data.Dataset objects from an
    ImageFolder-style directory (one subfolder per class).
    """
    full_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        labels="inferred",
        label_mode="categorical",
        image_size=config["img_size"],
        batch_size=config["batch_size"],
        seed=config["seed"],
        shuffle=True,
    )

    class_names = full_ds.class_names
    if config["selected_classes"]:
        keep_idx = [class_names.index(c) for c in config["selected_classes"]]
        print(f"Restricting to {len(keep_idx)} classes:", config["selected_classes"])
        # Re-load filtering to only selected class folders for a clean run
        tmp_dir = os.path.join(config["output_dir"], "filtered_dataset")
        if not os.path.exists(tmp_dir):
            os.makedirs(tmp_dir, exist_ok=True)
            for c in config["selected_classes"]:
                src = os.path.join(data_dir, c)
                dst = os.path.join(tmp_dir, c)
                if not os.path.exists(dst):
                    shutil.copytree(src, dst)
        full_ds = tf.keras.utils.image_dataset_from_directory(
            tmp_dir,
            labels="inferred",
            label_mode="categorical",
            image_size=config["img_size"],
            batch_size=config["batch_size"],
            seed=config["seed"],
            shuffle=True,
        )
        class_names = full_ds.class_names

    # Split full_ds into train/val/test by batches
    total_batches = tf.data.experimental.cardinality(full_ds).numpy()
    val_batches = int(total_batches * config["val_split"])
    test_batches = int(total_batches * config["test_split"])

    test_ds = full_ds.take(test_batches)
    remaining = full_ds.skip(test_batches)
    val_ds = remaining.take(val_batches)
    train_ds = remaining.skip(val_batches)

    # Augmentation applied only to training data
    augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.15),
        layers.RandomZoom(0.15),
        layers.RandomContrast(0.1),
        layers.RandomTranslation(0.1, 0.1),
    ], name="augmentation")

    normalization = layers.Rescaling(1.0 / 127.5, offset=-1)  # MobileNetV2 expects [-1, 1]

    def prep_train(x, y):
        x = augmentation(x, training=True)
        x = normalization(x)
        return x, y

    def prep_eval(x, y):
        x = normalization(x)
        return x, y

    train_ds = train_ds.map(prep_train, num_parallel_calls=tf.data.AUTOTUNE).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.map(prep_eval, num_parallel_calls=tf.data.AUTOTUNE).prefetch(tf.data.AUTOTUNE)
    test_ds = test_ds.map(prep_eval, num_parallel_calls=tf.data.AUTOTUNE).prefetch(tf.data.AUTOTUNE)

    return train_ds, val_ds, test_ds, class_names


# ============================================================
# 3. MODEL — MobileNetV2 transfer learning
# ============================================================
def build_model(num_classes, config):
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=config["img_size"] + (3,),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False  # phase 1: frozen

    inputs = tf.keras.Input(shape=config["img_size"] + (3,))
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = models.Model(inputs, outputs)
    return model, base_model


# ============================================================
# 4. TRAINING — frozen phase then fine-tune phase
# ============================================================
def train_model(model, base_model, train_ds, val_ds, config):
    model.compile(
        optimizer=optimizers.Adam(learning_rate=config["learning_rate"]),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    early_stop = callbacks.EarlyStopping(
        monitor="val_loss", patience=3, restore_best_weights=True
    )
    checkpoint_path = os.path.join(config["output_dir"], "best_frozen.keras")
    ckpt = callbacks.ModelCheckpoint(checkpoint_path, save_best_only=True, monitor="val_accuracy")

    print("\n=== Phase 1: training classifier head (base frozen) ===")
    history_frozen = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=config["epochs_frozen"],
        callbacks=[early_stop, ckpt],
    )

    # Phase 2: unfreeze top layers of MobileNetV2 for fine-tuning
    print("\n=== Phase 2: fine-tuning top layers of MobileNetV2 ===")
    base_model.trainable = True
    fine_tune_at = len(base_model.layers) - 30  # unfreeze last 30 layers only
    for layer in base_model.layers[:fine_tune_at]:
        layer.trainable = False

    model.compile(
        optimizer=optimizers.Adam(learning_rate=config["finetune_learning_rate"]),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    checkpoint_path_ft = os.path.join(config["output_dir"], "best_finetuned.keras")
    ckpt_ft = callbacks.ModelCheckpoint(checkpoint_path_ft, save_best_only=True, monitor="val_accuracy")

    history_finetune = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=config["epochs_finetune"],
        callbacks=[early_stop, ckpt_ft],
    )

    return model, history_frozen, history_finetune


# ============================================================
# 5. EVALUATION — accuracy, precision, recall, F1, confusion matrix
# ============================================================
def evaluate_model(model, test_ds, class_names, config):
    y_true, y_pred = [], []
    for x_batch, y_batch in test_ds:
        preds = model.predict(x_batch, verbose=0)
        y_true.extend(np.argmax(y_batch.numpy(), axis=1))
        y_pred.extend(np.argmax(preds, axis=1))

    y_true, y_pred = np.array(y_true), np.array(y_pred)

    acc = accuracy_score(y_true, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average="weighted", zero_division=0
    )
    cm = confusion_matrix(y_true, y_pred)

    metrics = {
        "accuracy": float(acc),
        "precision_weighted": float(precision),
        "recall_weighted": float(recall),
        "f1_weighted": float(f1),
        "num_test_samples": int(len(y_true)),
        "class_names": class_names,
    }

    print("\n=== Evaluation Results ===")
    print(json.dumps(metrics, indent=2))

    with open(os.path.join(config["output_dir"], "evaluation_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
    np.save(os.path.join(config["output_dir"], "confusion_matrix.npy"), cm)

    return metrics, cm


# ============================================================
# 6. TFLITE CONVERSION + QUANTIZATION
# ============================================================
def convert_to_tflite(model, config, representative_ds=None):
    converter = tf.lite.TFLiteConverter.from_keras_model(model)

    if config["quantization"] == "dynamic":
        # Smallest effort, ~4x smaller, weights-only quantization
        converter.optimizations = [tf.lite.Optimize.DEFAULT]

    elif config["quantization"] == "float16":
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_types = [tf.float16]

    elif config["quantization"] == "int8":
        # Full integer quantization — smallest & fastest, needs a
        # representative dataset to calibrate activation ranges
        if representative_ds is None:
            raise ValueError("int8 quantization requires representative_ds")

        def representative_data_gen():
            for x_batch, _ in representative_ds.take(100):
                for i in range(x_batch.shape[0]):
                    yield [tf.expand_dims(x_batch[i], axis=0)]

        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.representative_dataset = representative_data_gen
        converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
        converter.inference_input_type = tf.uint8
        converter.inference_output_type = tf.uint8

    tflite_model = converter.convert()

    output_path = os.path.join(config["output_dir"], "plantcare_model.tflite")
    with open(output_path, "wb") as f:
        f.write(tflite_model)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"\nTFLite model saved to {output_path} ({size_kb:.1f} KB)")
    return output_path, size_kb


# ============================================================
# 7. ON-DEVICE PERFORMANCE CHECK (simulated on this machine)
# ============================================================
def benchmark_tflite(tflite_path, config, num_runs=50):
    interpreter = tf.lite.Interpreter(model_path=tflite_path)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    dummy_input = np.random.rand(1, *config["img_size"], 3).astype(np.float32)

    # Warm-up
    interpreter.set_tensor(input_details[0]["index"], dummy_input)
    interpreter.invoke()

    times = []
    for _ in range(num_runs):
        start = time.perf_counter()
        interpreter.set_tensor(input_details[0]["index"], dummy_input)
        interpreter.invoke()
        _ = interpreter.get_tensor(output_details[0]["index"])
        times.append((time.perf_counter() - start) * 1000)  # ms

    avg_ms = float(np.mean(times))
    p95_ms = float(np.percentile(times, 95))
    print(f"\nAvg inference time: {avg_ms:.2f} ms | p95: {p95_ms:.2f} ms")
    return {"avg_inference_ms": avg_ms, "p95_inference_ms": p95_ms}


# ============================================================
# 8. EXPORT LABEL MAP — needed by the Flutter/RN app for display
# ============================================================
def export_label_map(class_names, config):
    label_map = {i: name for i, name in enumerate(class_names)}
    path = os.path.join(config["output_dir"], "label_map.json")
    with open(path, "w") as f:
        json.dump(label_map, f, indent=2)
    print(f"Label map saved to {path}")
    return path


# ============================================================
# MAIN — run the full pipeline end to end
# ============================================================
def main():
    print("Step 1/7: Downloading dataset...")
    dataset_root = download_plantvillage()
    # NOTE: inspect the printed path in Colab and update CONFIG["dataset_dir"]
    # to the folder that directly contains one subfolder per class, e.g.:
    # CONFIG["dataset_dir"] = dataset_root + "/PlantVillage/color"

    data_dir = CONFIG["dataset_dir"]

    print("Step 2/7: Building datasets...")
    train_ds, val_ds, test_ds, class_names = build_datasets(data_dir, CONFIG)
    print(f"Classes ({len(class_names)}):", class_names)

    print("Step 3/7: Building model...")
    model, base_model = build_model(len(class_names), CONFIG)
    model.summary()

    print("Step 4/7: Training...")
    model, hist_frozen, hist_finetune = train_model(model, base_model, train_ds, val_ds, CONFIG)

    print("Step 5/7: Evaluating...")
    metrics, cm = evaluate_model(model, test_ds, class_names, CONFIG)

    print("Step 6/7: Converting to TFLite...")
    tflite_path, size_kb = convert_to_tflite(model, CONFIG, representative_ds=train_ds)

    print("Step 7/7: Benchmarking + exporting label map...")
    bench = benchmark_tflite(tflite_path, CONFIG)
    export_label_map(class_names, CONFIG)

    summary = {**metrics, "model_size_kb": size_kb, **bench}
    print("\n=== FINAL SUMMARY ===")
    print(json.dumps(summary, indent=2))
    with open(os.path.join(CONFIG["output_dir"], "run_summary.json"), "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\nAll artifacts saved in: {CONFIG['output_dir']}")
    print("Copy plantcare_model.tflite and label_map.json into the")
    print("React Native app's assets/ folder for Stage 2.")


if __name__ == "__main__":
    main()
