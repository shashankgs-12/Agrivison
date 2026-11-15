const MAX_IMAGE_DIMENSION = 1024;
const MAX_BASE64_DATA_URL_BYTES = 300 * 1024;
const MAX_JPEG_BYTES = Math.floor((MAX_BASE64_DATA_URL_BYTES - 128) * 3 / 4);
const JPEG_QUALITY = 0.8;
const MIN_IMAGE_DIMENSION = 320;

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("Could not prepare the image for analysis."));
    reader.onerror = () => reject(new Error("Could not read the compressed image."));
    reader.readAsDataURL(blob);
  });
}

/** Resize to at most 1024px and compress to a JPEG payload below 300KB. */
export async function prepareImageForAnalysis(source: Blob | string): Promise<string> {
  const blob = typeof source === "string"
    ? await fetch(source).then((response) => {
        if (!response.ok) throw new Error("Could not read the selected image.");
        return response.blob();
      })
    : source;

  const imageUrl = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("This image could not be opened. Try a JPEG, PNG, or WebP photo."));
      element.src = imageUrl;
    });
    if (!image.naturalWidth || !image.naturalHeight) {
      throw new Error("This image has no readable dimensions. Choose another photo.");
    }

    const initialScale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Image processing is unavailable in this browser.");

    let scale = initialScale;
    while (true) {
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const compressed = await canvasToBlob(canvas);
      if (!compressed) throw new Error("Could not prepare the image for analysis.");
      if (compressed.size <= MAX_JPEG_BYTES) {
        const dataUrl = await readAsDataUrl(compressed);
        if (new Blob([dataUrl]).size > MAX_BASE64_DATA_URL_BYTES) {
          throw new Error("The photo is still too large after compression. Choose a smaller image.");
        }
        return dataUrl;
      }
      const nextScale = scale * Math.min(0.88, Math.sqrt(MAX_JPEG_BYTES / compressed.size) * 0.92);
      if (Math.min(canvas.width, canvas.height) <= MIN_IMAGE_DIMENSION || nextScale >= scale) {
        throw new Error("The photo is too detailed to compress below 300KB. Choose a smaller image.");
      }
      scale = Math.max(nextScale, MIN_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    }
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
