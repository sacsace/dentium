const DEFAULT_FOCAL = { x: 50, y: 38 };

type FaceDetectorLike = {
  detect: (source: HTMLImageElement) => Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
};

function getFaceDetector(): FaceDetectorLike | null {
  if (typeof window === "undefined") return null;
  const FaceDetectorCtor = (window as Window & { FaceDetector?: new (opts?: object) => FaceDetectorLike })
    .FaceDetector;
  if (!FaceDetectorCtor) return null;
  try {
    return new FaceDetectorCtor({ maxDetectedFaces: 1, fastMode: true });
  } catch {
    return null;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

/** Detect face center as object-position percentages (0–100). Falls back to portrait default. */
export async function detectFaceCenter(imageSrc: string): Promise<{ x: number; y: number }> {
  try {
    const img = await loadImage(imageSrc);
    const detector = getFaceDetector();

    if (detector) {
      const faces = await detector.detect(img);
      if (faces.length > 0) {
        const box = faces[0].boundingBox;
        const x = ((box.x + box.width / 2) / img.naturalWidth) * 100;
        const y = ((box.y + box.height / 2) / img.naturalHeight) * 100;
        return {
          x: Math.min(100, Math.max(0, Math.round(x * 10) / 10)),
          y: Math.min(100, Math.max(0, Math.round(y * 10) / 10)),
        };
      }
    }
  } catch {
    /* FaceDetector unavailable or detection failed */
  }

  return { ...DEFAULT_FOCAL };
}

export { DEFAULT_FOCAL as DEFAULT_PHOTO_FOCAL };
