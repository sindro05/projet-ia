"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Mode = "empty" | "camera" | "preview";

type PhotoCaptureProps = {
  label: string;
  helpText?: string;
  onChange: (file: File | null) => void;
  /** Set to false to only allow file upload (no webcam button). Defaults to true. */
  allowCamera?: boolean;
};

export default function PhotoCapture({
  label,
  helpText,
  onChange,
  allowCamera = true,
}: PhotoCaptureProps) {
  const [mode, setMode] = useState<Mode>("empty");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setMode("camera");
      // Video element mounts this render; attach once it exists.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch {
      setCameraError(
        "Impossible d'accéder à la caméra. Vérifiez les autorisations du navigateur ou importez une photo."
      );
    }
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        stopStream();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setMode("preview");
        onChange(file);
      },
      "image/jpeg",
      0.92
    );
  }, [onChange, stopStream]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      stopStream();
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setMode("preview");
      onChange(file);
    },
    [onChange, stopStream]
  );

  const reset = useCallback(() => {
    stopStream();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCameraError(null);
    setMode("empty");
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onChange, previewUrl, stopStream]);

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-paper">{label}</p>

      <div className="reticle aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-card border border-paper-dim/30 bg-ink-soft">
        <span className="rt-tr" />
        <span className="rt-bl" />

        {mode === "empty" && (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-paper-dim/60"
              aria-hidden="true"
            >
              <path
                d="M4 8V6a2 2 0 0 1 2-2h2M20 8V6a2 2 0 0 0-2-2h-2M4 16v2a2 2 0 0 0 2 2h2M20 16v2a2 2 0 0 1-2 2h-2M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-xs text-paper-dim/70">Aucune photo pour le moment</span>
          </div>
        )}

        {mode === "camera" && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        )}

        {mode === "preview" && previewUrl && (
          // Object URL, not a remote asset — a plain <img> avoids next/image config for blobs.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Photo sélectionnée" className="h-full w-full object-cover" />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {helpText && mode === "empty" && (
        <p className="mt-2 max-w-[260px] text-xs text-paper-dim/70">{helpText}</p>
      )}

      {cameraError && <p className="mt-2 max-w-[260px] text-xs text-rust">{cameraError}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {mode === "empty" && (
          <>
            {allowCamera && (
              <button
                type="button"
                onClick={startCamera}
                className="rounded-card border border-gold/50 px-3 py-1.5 text-sm text-gold-soft transition-colors hover:bg-gold/10"
              >
                Activer la caméra
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-card border border-paper-dim/30 px-3 py-1.5 text-sm text-paper-dim transition-colors hover:bg-paper/5"
            >
              Importer une photo
            </button>
          </>
        )}

        {mode === "camera" && (
          <>
            <button
              type="button"
              onClick={capture}
              className="rounded-card bg-gold px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-gold-soft"
            >
              Capturer
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-card border border-paper-dim/30 px-3 py-1.5 text-sm text-paper-dim transition-colors hover:bg-paper/5"
            >
              Annuler
            </button>
          </>
        )}

        {mode === "preview" && (
          <button
            type="button"
            onClick={reset}
            className="rounded-card border border-paper-dim/30 px-3 py-1.5 text-sm text-paper-dim transition-colors hover:bg-paper/5"
          >
            Reprendre la photo
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
