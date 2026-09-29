export const MAX_PROFILE_PHOTO_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_PROFILE_PHOTO_BYTES = 512 * 1024;

const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateProfilePhotoFile(file: File): string | null {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    return "Choose a JPEG, PNG, or WebP image.";
  }
  if (file.size <= 0 || file.size > MAX_PROFILE_PHOTO_FILE_SIZE) {
    return "Choose an image smaller than 10 MB.";
  }
  return null;
}

export async function cropAndCompressProfilePhoto(
  file: File,
  crop: { x: number; y: number }
): Promise<string> {
  const previewUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("The selected image could not be opened."));
      element.src = previewUrl;
    });

    if (!image.naturalWidth || !image.naturalHeight) {
      throw new Error("The selected image has no readable dimensions.");
    }
    if (
      image.naturalWidth > 12000 ||
      image.naturalHeight > 12000 ||
      image.naturalWidth * image.naturalHeight > 50_000_000
    ) {
      throw new Error("This image is too large to crop safely. Choose a smaller photo.");
    }

    const outputSize = 512;
    const scale = Math.max(outputSize / image.naturalWidth, outputSize / image.naturalHeight);
    const scaledWidth = image.naturalWidth * scale;
    const scaledHeight = image.naturalHeight * scale;
    const xOffset = (scaledWidth - outputSize) * Math.min(100, Math.max(0, crop.x)) / 100;
    const yOffset = (scaledHeight - outputSize) * Math.min(100, Math.max(0, crop.y)) / 100;
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Photo editing is unavailable in this browser.");
    context.drawImage(image, -xOffset, -yOffset, scaledWidth, scaledHeight);

    let compressed: Blob | null = null;
    for (const quality of [0.84, 0.74, 0.64]) {
      compressed = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality)
      );
      if (compressed && compressed.size <= MAX_PROFILE_PHOTO_BYTES) break;
    }
    if (!compressed || compressed.size > MAX_PROFILE_PHOTO_BYTES) {
      throw new Error("This photo could not be compressed enough. Choose another image.");
    }

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === "string"
          ? resolve(reader.result)
          : reject(new Error("The cropped photo could not be prepared."));
      reader.onerror = () => reject(new Error("The cropped photo could not be read."));
      reader.readAsDataURL(compressed);
    });
  } finally {
    URL.revokeObjectURL(previewUrl);
  }
}
