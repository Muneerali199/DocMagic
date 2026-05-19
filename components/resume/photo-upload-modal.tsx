"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, ZoomIn, ZoomOut, Move, Trash2 } from "lucide-react";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const CROP_PX = 200; // canvas output size (square, rendered as circle via CSS)

export interface PhotoMeta {
  x: number;
  y: number;
  scale: number;
}

const DEFAULT_META: PhotoMeta = { x: 0, y: 0, scale: 1 };

export interface PhotoUploadModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with a square PNG data-URL (cropped) and the transform metadata */
  onSave: (dataUrl: string, meta: PhotoMeta) => void;
  /** Called when the user wants to remove the existing photo */
  onRemove: () => void;
  currentPhoto?: string;
  currentMeta?: PhotoMeta;
}

export function PhotoUploadModal({
  open,
  onClose,
  onSave,
  onRemove,
  currentPhoto,
  currentMeta,
}: PhotoUploadModalProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [meta, setMeta] = useState<PhotoMeta>({ x: 0, y: 0, scale: 1 });
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStart = useRef<{ mx: number; my: number; ix: number; iy: number } | null>(null);

  // Initialise state whenever the modal opens
  useEffect(() => {
    if (!open) return;
    const photo = currentPhoto ?? "";
    const m = currentMeta
      ? { x: currentMeta.x * CROP_PX, y: currentMeta.y * CROP_PX, scale: currentMeta.scale }
      : DEFAULT_META;
    setImgSrc(photo);
    setMeta(m);
    setError("");
    if (photo) {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        drawCanvas(img, m);
      };
      img.src = photo;
    } else {
      imgRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function drawCanvas(img: HTMLImageElement, m: PhotoMeta) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const coverScale = Math.max(CROP_PX / img.naturalWidth, CROP_PX / img.naturalHeight);
    const dw = img.naturalWidth * coverScale * m.scale;
    const dh = img.naturalHeight * coverScale * m.scale;
    const dx = (CROP_PX - dw) / 2 + m.x;
    const dy = (CROP_PX - dh) / 2 + m.y;
    ctx.clearRect(0, 0, CROP_PX, CROP_PX);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // Redraw canvas on every meta / imgSrc change
  useEffect(() => {
    if (imgRef.current) drawCanvas(imgRef.current, meta);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta, imgSrc]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, or WebP images are allowed.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Image must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const newMeta = DEFAULT_META;
      setImgSrc(dataUrl);
      setMeta(newMeta);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        drawCanvas(img, newMeta);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!imgSrc) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ix: meta.x, iy: meta.y };
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging || !dragStart.current) return;
      setMeta((prev) => ({
        ...prev,
        x: dragStart.current!.ix + (e.clientX - dragStart.current!.mx),
        y: dragStart.current!.iy + (e.clientY - dragStart.current!.my),
      }));
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const handleSave = () => {
    const img = imgRef.current;
    if (!img) return;
    const offscreen = document.createElement("canvas");
    offscreen.width = CROP_PX;
    offscreen.height = CROP_PX;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;
    // Circular clip for the saved image
    ctx.beginPath();
    ctx.arc(CROP_PX / 2, CROP_PX / 2, CROP_PX / 2, 0, Math.PI * 2);
    ctx.clip();
    const coverScale = Math.max(CROP_PX / img.naturalWidth, CROP_PX / img.naturalHeight);
    const dw = img.naturalWidth * coverScale * meta.scale;
    const dh = img.naturalHeight * coverScale * meta.scale;
    const dx = (CROP_PX - dw) / 2 + meta.x;
    const dy = (CROP_PX - dh) / 2 + meta.y;
    ctx.drawImage(img, dx, dy, dw, dh);
    onSave(offscreen.toDataURL("image/png"), {
      x: meta.x / CROP_PX,
      y: meta.y / CROP_PX,
      scale: meta.scale,
    });
  };

  const handleRemove = () => {
    setImgSrc("");
    setMeta(DEFAULT_META);
    imgRef.current = null;
    if (currentPhoto) {
      onRemove();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Profile Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload button */}
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {imgSrc ? "Change photo" : "Upload photo (JPG, PNG, WebP - max 2 MB)"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {imgSrc && (
            <>
              {/* Live crop preview */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Move className="w-3 h-3" /> Drag to reposition
                </p>
                <canvas
                  ref={canvasRef}
                  width={CROP_PX}
                  height={CROP_PX}
                  aria-label="Profile photo crop preview. Drag to reposition."
                  className="rounded-full border-2 border-gray-300 select-none"
                  style={{
                    cursor: isDragging ? "grabbing" : "grab",
                    touchAction: "none",
                    width: CROP_PX,
                    height: CROP_PX,
                  }}
                  onPointerDown={handlePointerDown}
                />
              </div>

              {/* Zoom slider */}
              <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={meta.scale}
                  onChange={(e) =>
                    setMeta((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))
                  }
                  className="flex-1 accent-blue-600"
                />
                <ZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </>
          )}

          <div className="flex justify-between pt-1">
            {imgSrc ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              {imgSrc && (
                <Button size="sm" onClick={handleSave}>
                  Save Photo
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
