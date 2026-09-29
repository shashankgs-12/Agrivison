const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

/** Resize and JPEG-compress a photo before sending it to the vision API. */
export async function prepareImageForAnalysis(source: Blob | string): Promise<string> {
  const blob =
    typeof source === "string"
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

    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Image processing is unavailable in this browser.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const compressed = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result ? resolve(result) : reject(new Error("Could not prepare the image for analysis.")),
        "image/jpeg",
        JPEG_QUALITY
      );
    });

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === "string"
          ? resolve(reader.result)
          : reject(new Error("Could not prepare the image for analysis."));
      reader.onerror = () => reject(new Error("Could not read the compressed image."));
      reader.readAsDataURL(compressed);
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
