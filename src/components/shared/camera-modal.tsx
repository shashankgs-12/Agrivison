"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, X, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = async (mode: "environment" | "user") => {
    setError(null);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please allow camera permissions in your browser or select an image file.");
    }
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera(facingMode);
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const handleTakeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(dataUrl);
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setError(null);
    onClose();
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2 font-bold text-base">
            <Camera className="h-5 w-5 text-emerald-400" />
            <span>Camera Capture</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video / Snapshot View */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-rose-400 space-y-2">
              <AlertCircle className="h-10 w-10 mx-auto" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera controls overlay */}
          {!capturedImage && !error && (
            <div className="absolute top-3 right-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFacingMode}
                className="bg-slate-900/70 border-slate-700 text-white hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Flip
              </Button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <Button
                variant="outline"
                onClick={() => setCapturedImage(null)}
                className="flex-1 text-slate-300 border-slate-700"
              >
                Retake
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Use Photo
              </Button>
            </>
          ) : (
            <Button
              disabled={!!error}
              onClick={handleTakeSnapshot}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-6 text-base shadow-lg shadow-emerald-900/30"
            >
              <Camera className="h-5 w-5 mr-2" />
              Capture Snapshot
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
