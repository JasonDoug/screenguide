import { useCallback, useRef, useState } from "react";

export function useScreenStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startStream = useCallback(async () => {
    setError(null);
    try {
      const displayMedia: MediaStream = await navigator.mediaDevices.getDisplayMedia(
        {
          video: { frameRate: 2 },
          audio: false,
        },
      );
      streamRef.current = displayMedia;
      if (videoRef.current) {
        videoRef.current.srcObject = displayMedia;
        await videoRef.current.play();
      }
      setIsStreaming(true);

      displayMedia.getVideoTracks()[0]?.addEventListener("ended", () => {
        stopStream();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("NotAllowedError") || msg.includes("Permission denied")) {
        setError("Screen sharing permission was denied. Please allow access and try again.");
      } else if (msg.includes("NotFound") || msg.includes("NotSupported")) {
        setError("Screen sharing is not supported in this browser.");
      } else {
        setError(`Failed to start screen sharing: ${msg}`);
      }
      setIsStreaming(false);
    }
  }, []);

  const stopStream = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  return { videoRef, isStreaming, error, startStream, stopStream };
}
