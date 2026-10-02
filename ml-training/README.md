# ml-training

Home for the YOLO layout model (classes: `header, photo, table, section-title, skills-block, signature, logo`).

1. Label 300-500 CV page images (Label Studio / Roboflow), export in YOLO format to `ml-training/dataset/`.
2. Train: `yolo detect train data=dataset/data.yaml model=yolov8n.pt epochs=60 imgsz=960`
3. Copy `best.pt` to `backend/app/ml/yolo/weights/layout.pt` and set `YOLO_WEIGHTS_PATH=/app/app/ml/yolo/weights/layout.pt`.

Until then the pipeline runs without YOLO: PyMuPDF text blocks, a column-ordering heuristic, and OCR fallback for scanned pages.
