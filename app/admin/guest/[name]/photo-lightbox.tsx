// app/admin/guest/[name]/photo-lightbox.tsx
"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize,
  Pause,
  Play,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import type { PhotoDto } from "@/features/photos/types";

interface PhotoLightboxProps {
  photos: PhotoDto[];
  startIndex: number;
  onClose: () => void;
  onDownload: (photo: PhotoDto) => void;
  downloadingId: string | null;
}

const AUTOPLAY_MS = 4000;

export function PhotoLightbox({
  photos,
  startIndex,
  onClose,
  onDownload,
  downloadingId,
}: PhotoLightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const [playing, setPlaying] = useState(false);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (photos.length === 0) {
      onClose();
      return;
    }
    if (index >= photos.length) {
      setIndex(photos.length - 1);
    }
  }, [photos.length, index, onClose]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        goPrev();
      } else if (event.key === "ArrowRight") {
        goNext();
      } else if (event.key === " ") {
        event.preventDefault();
        setPlaying((p) => !p);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goPrev, goNext, onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (!playing || photos.length <= 1) return;
    const timer = setInterval(goNext, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [playing, photos.length, goNext]);

  const photo = photos[index];
  if (!photo) return null;

  const isDownloading = downloadingId === photo.id;

  return (
    <div
      role="dialog"
      aria-label="Galeri fotografish"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/95 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Mbylle"
        tabIndex={-1}
      />

      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <p className="font-serif text-sm tracking-wide text-surface/80">
          {index + 1} / {photos.length}
        </p>
        <div className="flex items-center gap-2">
          {photos.length > 1 ? (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-button bg-surface/15 text-surface backdrop-blur-sm transition-colors duration-200 hover:bg-surface/30"
              aria-label={playing ? "Ndalo slide-show-in" : "Nis slide-show-in"}
            >
              {playing ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onDownload(photo)}
            disabled={isDownloading}
            className="inline-flex h-10 w-10 items-center justify-center rounded-button bg-surface/15 text-surface backdrop-blur-sm transition-colors duration-200 hover:bg-surface/30 disabled:opacity-50"
            aria-label={`Shkarko ${photo.originalName}`}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-button bg-surface/15 text-surface backdrop-blur-sm transition-colors duration-200 hover:bg-surface/30"
            aria-label="Mbylle"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <TransformWrapper
        key={photo.id}
        initialScale={1}
        minScale={1}
        maxScale={6}
        centerOnInit
        doubleClick={{ mode: "toggle", step: 1.8 }}
        wheel={{ step: 0.2 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent
              wrapperClass="!w-screen !h-screen"
              contentClass="!w-screen !h-screen !flex !items-center !justify-center"
            >
              <img
                src={photo.fileUrl}
                alt={photo.originalName}
                draggable={false}
                className="max-h-[80vh] max-w-[92vw] select-none object-contain"
              />
            </TransformComponent>

            <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 px-4 py-5 sm:px-6">
              <button
                type="button"
                onClick={goPrev}
                disabled={photos.length <= 1}
                className="inline-flex h-12 w-12 items-center justify-center rounded-button bg-surface/15 text-surface backdrop-blur-sm transition-colors duration-200 hover:bg-surface/30 disabled:opacity-30"
                aria-label="Foto e mëparshme"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              <div className="flex items-center gap-1 rounded-button bg-surface/15 p-1 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => zoomOut()}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-button text-surface transition-colors duration-200 hover:bg-surface/20"
                  aria-label="Zvogëlo"
                >
                  <ZoomOut className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => resetTransform()}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-button text-surface transition-colors duration-200 hover:bg-surface/20"
                  aria-label="Përshtate"
                >
                  <Maximize className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => zoomIn()}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-button text-surface transition-colors duration-200 hover:bg-surface/20"
                  aria-label="Zmadho"
                >
                  <ZoomIn className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={goNext}
                disabled={photos.length <= 1}
                className="inline-flex h-12 w-12 items-center justify-center rounded-button bg-surface/15 text-surface backdrop-blur-sm transition-colors duration-200 hover:bg-surface/30 disabled:opacity-30"
                aria-label="Foto tjetër"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
