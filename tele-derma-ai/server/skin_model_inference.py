from transformers import pipeline
import json
import sys

image_path = sys.argv[1]

classifier = pipeline(
    "image-classification",
    model="Kuldeepmishra3/vit-large-skin-cancer-ham10000",
)

results = classifier(image_path, top_k=3)
if not results:
    raise ValueError("No classification results returned")

top = results[0]
print(json.dumps({
    "label": str(top["label"]),
    "confidence": float(top["score"])
}))
