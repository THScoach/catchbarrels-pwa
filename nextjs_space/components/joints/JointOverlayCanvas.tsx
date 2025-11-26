"use client";

import React, { useEffect, useRef } from "react";
import type { JointFrame } from "@/lib/joints/types";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
  frames: JointFrame[];
}

export const JointOverlayCanvas: React.FC<Props> = ({ videoRef, frames }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Resize canvas to match video element
  useEffect(() => {
    function syncSize() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    syncSize();
    window.addEventListener("resize", syncSize);
    return () => window.removeEventListener("resize", syncSize);
  }, [videoRef]);

  // Draw current frame joints whenever video time updates
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || frames.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function render() {
      if (!ctx || !video || !canvas) return;

      const currentTimeMs = video.currentTime * 1000;

      // Find the closest frame by timestamp
      let closest = frames[0];
      let minDiff = Math.abs(frames[0].timestamp - currentTimeMs);

      for (const frame of frames) {
        const diff = Math.abs(frame.timestamp - currentTimeMs);
        if (diff < minDiff) {
          minDiff = diff;
          closest = frame;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw joints: simple circles
      ctx.strokeStyle = "#E8B14E"; // BARRELS gold
      ctx.fillStyle = "#E8B14E";
      ctx.lineWidth = 2;

      for (const joint of closest.joints) {
        const x = joint.x * canvas.width;
        const y = joint.y * canvas.height;

        // Draw circle for each joint
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Optionally draw joint name
        if (joint.confidence > 0.5) {
          ctx.fillStyle = "white";
          ctx.font = "10px sans-serif";
          ctx.fillText(joint.name, x + 8, y - 8);
          ctx.fillStyle = "#E8B14E";
        }
      }

      requestAnimationFrame(render);
    }

    const id = requestAnimationFrame(render);
    return () => cancelAnimationFrame(id);
  }, [videoRef, frames]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    />
  );
};
