// app/upload/components/photo-upload-form.tsx
"use client";

import { Camera, Check, ImagePlus, Loader2, Play, Plus, Upload, X } from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PhotoUploadFormProps {
  maxUploadSizeMb: number;
  maxFilesPerUpload: number;
}

interface PreviewFile {
  id: string;
  file: File;
  url: string;
  isVideo: boolean;
}

interface UploadSession {
  signedUrl: string;
  path: string;
  publicUrl: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
}

interface RecordedPhoto {
  fileUrl: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];
const MAX_VIDEO_SIZE_MB = 200;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_DURATION_SECONDS = 300;

function isVideoType(type: string): boolean {
  return ACCEPTED_VIDEO_TYPES.includes(type);
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    const objectUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(objectUrl);
      resolve(duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Couldn't read video metadata"));
    };

    video.src = objectUrl;
  });
}

export function PhotoUploadForm({ maxUploadSizeMb, maxFilesPerUpload }: PhotoUploadFormProps) {
  const [guestName, setGuestName] = useState("");
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const dragCounterRef = useRef(0);
  const maxUploadSizeBytes = useMemo(() => maxUploadSizeMb * 1024 * 1024, [maxUploadSizeMb]);

  useEffect(() => {
    return () => {
      for (const preview of files) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [files]);

  function replaceFiles(nextFiles: PreviewFile[]): void {
    setFiles((currentFiles) => {
      for (const preview of currentFiles) {
        URL.revokeObjectURL(preview.url);
      }
      return nextFiles;
    });
    setProgressMap({});
  }

  function appendFiles(nextFiles: PreviewFile[]): void {
    setFiles((currentFiles) => [...currentFiles, ...nextFiles]);
  }

  async function processFiles(incoming: File[], mode: "replace" | "append"): Promise<void> {
    setError("");
    setSuccess(false);

    if (incoming.length === 0) {
      if (mode === "replace") replaceFiles([]);
      return;
    }

    const existingCount = mode === "append" ? files.length : 0;

    if (existingCount + incoming.length > maxFilesPerUpload) {
      setError(`Ju lutemi zgjidhni jo më shumë se ${maxFilesPerUpload} skedarë.`);
      return;
    }

    const invalidType = incoming.find((file) => !ACCEPTED_TYPES.includes(file.type));
    if (invalidType) {
      setError("Ju lutemi ngarkoni vetëm foto (JPEG, PNG, WebP, HEIC, HEIF) ose video (MP4, MOV, WebM).");
      return;
    }

    for (const file of incoming) {
      if (isVideoType(file.type)) {
        if (file.size > MAX_VIDEO_SIZE_BYTES) {
          setError(`Çdo video duhet të jetë ${MAX_VIDEO_SIZE_MB}MB ose më e vogël.`);
          return;
        }
      } else if (file.size > maxUploadSizeBytes) {
        setError(`Çdo foto duhet të jetë ${maxUploadSizeMb}MB ose më e vogël.`);
        return;
      }
    }

    setIsProcessing(true);

    try {
      for (const file of incoming) {
        if (!isVideoType(file.type)) continue;
        try {
          const duration = await getVideoDuration(file);
          if (duration > MAX_VIDEO_DURATION_SECONDS + 1) {
            setError(`Çdo video duhet të jetë ${Math.round(MAX_VIDEO_DURATION_SECONDS / 60)} minuta ose më e shkurtër.`);
            return;
          }
        } catch {
          setError("Një nga videot nuk u verifikua dot. Provoni një tjetër.");
          return;
        }
      }

      const previews = incoming.map((file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        url: URL.createObjectURL(file),
        isVideo: isVideoType(file.type),
      }));

      if (mode === "append") {
        appendFiles(previews);
      } else {
        replaceFiles(previews);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    void processFiles(Array.from(event.target.files ?? []), files.length > 0 ? "append" : "replace");
    event.target.value = "";
  }

  function handleDragEnter(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current += 1;
    if (event.dataTransfer.items?.length > 0) {
      setIsDragActive(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragActive(false);
    }
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragActive(false);

    const dropped = Array.from(event.dataTransfer.files ?? []);
    if (dropped.length > 0) {
      void processFiles(dropped, files.length > 0 ? "append" : "replace");
    }
  }

  async function uploadOne(preview: PreviewFile): Promise<RecordedPhoto> {
    const signResponse = await fetch("/api/photos/sign-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: preview.file.name,
        mimeType: preview.file.type,
        fileSize: preview.file.size,
      }),
    });

    if (!signResponse.ok) {
      const errorBody = (await signResponse.json().catch(() => ({}))) as { error?: string };
      throw new Error(errorBody.error ?? "Sesioni i ngarkimit dështoi.");
    }

    const session = (await signResponse.json()) as UploadSession;

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", session.signedUrl);
      xhr.setRequestHeader("Content-Type", preview.file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          setProgressMap((prev) => ({ ...prev, [preview.id]: pct }));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setProgressMap((prev) => ({ ...prev, [preview.id]: 100 }));
          resolve();
          return;
        }
        reject(new Error(`Ngarkimi i skedarit dështoi (${xhr.status}).`));
      };
      xhr.onerror = () => reject(new Error("Lidhja u ndërpre gjatë ngarkimit."));
      xhr.send(preview.file);
    });

    return {
      fileUrl: session.publicUrl,
      fileName: session.path,
      originalName: session.originalName,
      fileSize: session.fileSize,
      mimeType: session.mimeType,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (files.length === 0) {
      setError("Ju lutemi zgjidhni të paktën një skedar.");
      return;
    }

    setIsUploading(true);
    setProgressMap(Object.fromEntries(files.map((f) => [f.id, 0])));

    try {
      const uploaded = await Promise.all(files.map((preview) => uploadOne(preview)));

      const recordResponse = await fetch("/api/photos/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName, photos: uploaded }),
      });

      if (!recordResponse.ok) {
        const errorBody = (await recordResponse.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorBody.error ?? "Regjistrimi i skedarëve dështoi.");
      }

      replaceFiles([]);
      setGuestName("");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ngarkimi dështoi. Ju lutemi provoni përsëri.");
    } finally {
      setIsUploading(false);
    }
  }

  function removeFile(id: string): void {
    setSuccess(false);
    setFiles((currentFiles) => {
      const target = currentFiles.find((file) => file.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return currentFiles.filter((file) => file.id !== id);
    });
    setProgressMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  const canAddMore = files.length < maxFilesPerUpload;
  const submitLabel = files.length > 0 ? `Ngarko ${files.length}` : "Ngarko";
  const totalProgress = files.length
    ? Math.round(files.reduce((sum, f) => sum + (progressMap[f.id] ?? 0), 0) / files.length)
    : 0;

  return (
    <Card className="relative overflow-hidden border-border/60 bg-surface/95 shadow-lg backdrop-blur-sm">
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 origin-left bg-primary transition-transform duration-200 ease-out",
          isUploading ? "scale-x-100" : "scale-x-0"
        )}
        style={isUploading ? { transform: `scaleX(${totalProgress / 100})` } : undefined}
      />

      <CardContent className="space-y-6 p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="guestName" className="flex items-baseline justify-between">
              <span>Emri juaj</span>
              <span className="font-serif text-xs italic text-muted-foreground">opsionale</span>
            </Label>
            <Input
              id="guestName"
              name="guestName"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              placeholder="Sa do donim ta dinim..."
              autoComplete="name"
              disabled={isUploading}
              className="h-12"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="photos">Fotot dhe videot</Label>
              {files.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-xs font-medium text-foreground">
                  <Camera className="h-3 w-3" aria-hidden="true" />
                  {files.length}/{maxFilesPerUpload}
                </span>
              ) : null}
            </div>

            {files.length === 0 ? (
              <label
                htmlFor="photos"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={cn(
                  "group relative flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed px-4 py-12 text-center transition-all duration-300",
                  isDragActive
                    ? "scale-[1.01] border-primary bg-cream"
                    : "border-border bg-surface-soft hover:border-primary/50 hover:bg-cream"
                )}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <ImagePlus
                    className={cn(
                      "h-7 w-7 transition-colors duration-300",
                      isDragActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    )}
                    aria-hidden="true"
                  />
                </div>
                <span className="mt-5 font-serif text-2xl text-foreground">
                  {isDragActive ? "Lëshojini këtu" : "Zgjidhni fotot ose videot"}
                </span>
                <span className="mt-1 font-serif text-sm italic text-muted-foreground">
                  Video deri në 5 minuta · Tërhiqini këtu nga galeria
                </span>
              </label>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {files.map((preview) => {
                  const pct = progressMap[preview.id] ?? 0;
                  return (
                    <div
                      key={preview.id}
                      className="group/tile relative aspect-square overflow-hidden rounded-2xl border border-border bg-cream shadow-sm transition-shadow duration-300 hover:shadow-md animate-fade-up"
                    >
                      {preview.isVideo ? (
                        <>
                          <video
                            src={preview.url}
                            muted
                            playsInline
                            preload="metadata"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/tile:scale-105"
                          />
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/15">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface/90 shadow-md backdrop-blur-sm">
                              <Play className="h-5 w-5 text-primary" aria-hidden="true" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <img
                          src={preview.url}
                          alt={preview.file.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/tile:scale-105"
                        />
                      )}
                      {isUploading ? (
                        <div className="absolute inset-0 flex items-end bg-foreground/30 backdrop-blur-[1px]">
                          <div className="h-1 w-full bg-surface/40">
                            <div
                              className="h-full bg-primary transition-all duration-200 ease-out"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeFile(preview.id)}
                          className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-button bg-surface/95 text-foreground shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-primary-foreground"
                          aria-label={`Hiq ${preview.file.name}`}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {canAddMore && !isUploading ? (
                  <label
                    htmlFor="photos"
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={cn(
                      "group flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-all duration-300",
                      isDragActive
                        ? "border-primary bg-cream"
                        : "border-border bg-surface-soft hover:border-primary/50 hover:bg-cream"
                    )}
                  >
                    <Plus
                      className="h-7 w-7 text-muted-foreground transition-colors duration-300 group-hover:text-primary"
                      aria-hidden="true"
                    />
                    <span className="font-serif text-xs italic text-muted-foreground">
                      Shtoni më shumë
                    </span>
                  </label>
                ) : null}
              </div>
            )}

            <Input
              id="photos"
              name="photos"
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              multiple
              className="sr-only"
              onChange={handleFileChange}
              disabled={isUploading || isProcessing}
            />

            {isProcessing ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                Po kontrollohen skedarët...
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="flex items-start gap-3 rounded-2xl border border-pink-foreground/15 bg-pink px-4 py-3 text-sm text-pink-foreground animate-fade-up">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-foreground/15">
                <X className="h-3 w-3" aria-hidden="true" />
              </div>
              <p className="leading-6">{error}</p>
            </div>
          ) : null}

          {success ? (
            <div className="flex items-start gap-3 rounded-2xl border border-sage/50 bg-sage/40 px-4 py-3 text-sm text-sage-foreground animate-fade-up">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage">
                <Check className="h-3 w-3 text-sage-foreground" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <p className="font-medium">Faleminderit!</p>
                <p className="leading-6">Skedarët tuaj janë në galeri tani. Ngarkoni edhe më shumë nëse dëshironi.</p>
              </div>
            </div>
          ) : null}

          <Button
            type="submit"
            className="h-14 w-full text-base"
            disabled={isUploading || isProcessing || files.length === 0}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                <span>{totalProgress > 0 ? `Po ngarkohen... ${totalProgress}%` : "Po ngarkohen..."}</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" aria-hidden="true" />
                <span>{submitLabel}</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
