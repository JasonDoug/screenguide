const MAX_WIDTH = 1280;
const MAX_HEIGHT = 720;
const JPEG_QUALITY = 0.6;

export async function captureFrame(
  video: HTMLVideoElement,
): Promise<string | null> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const videoWidth = video.videoWidth || MAX_WIDTH;
  const videoHeight = video.videoHeight || MAX_HEIGHT;

  const scale = Math.min(
    MAX_WIDTH / videoWidth,
    MAX_HEIGHT / videoHeight,
    1,
  );
  canvas.width = Math.round(videoWidth * scale);
  canvas.height = Math.round(videoHeight * scale);

  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    return null;
  }
}

export function stripDataPrefix(dataUrl: string): string {
  const idx = dataUrl.indexOf(",");
  return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
}
