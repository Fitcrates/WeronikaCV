"use client";

import { useRef, useEffect, type CSSProperties } from "react";
import Image from "next/image";

interface FaceConfig {
  id: number;
  desktop: { left: string; top: string; width: number };
  mobile: { left: string; top: string; width: number };
  rotate: number;
}

type FaceStyle = CSSProperties & {
  "--face-left": string;
  "--face-top": string;
  "--face-width": string;
  "--face-left-mobile": string;
  "--face-top-mobile": string;
  "--face-width-mobile": string;
  "--face-rotate": string;
};

const facesConfig: FaceConfig[] = [
  {
    id: 1,
    desktop: { left: "25%", top: "12%", width: 105 },
    mobile: { left: "18%", top: "10%", width: 79 },
    rotate: -8,
  },
  {
    id: 2,
    desktop: { left: "6%", top: "33%", width: 105 },
    mobile: { left: "2%", top: "32%", width: 79 },
    rotate: 5,
  },
  {
    id: 3,
    desktop: { left: "10%", top: "78%", width: 105 },
    mobile: { left: "8%", top: "72%", width: 79 },
    rotate: -5,
  },
  {
    id: 4,
    desktop: { left: "38%", top: "38%", width: 152 },
    mobile: { left: "33%", top: "36%", width: 114 },
    rotate: 8,
  },
  {
    id: 5,
    desktop: { left: "65%", top: "20%", width: 188 },
    mobile: { left: "58%", top: "18%", width: 141 },
    rotate: -6,
  },
  {
    id: 6,
    desktop: { left: "30%", top: "66%", width: 82 },
    mobile: { left: "26%", top: "63%", width: 62 },
    rotate: 10,
  },
  {
    id: 7,
    desktop: { left: "55%", top: "78%", width: 62 },
    mobile: { left: "50%", top: "72%", width: 47 },
    rotate: -12,
  },
  {
    id: 8,
    desktop: { left: "78%", top: "77%", width: 92 },
    mobile: { left: "72%", top: "72%", width: 69 },
    rotate: 6,
  },
];

export default function FloatingFaces() {
  const containerRef = useRef<HTMLDivElement>(null);
  const faceRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mouseX = -1000;
    let mouseY = -1000;
    let isHovering = false;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseEnter = () => {
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
      mouseX = -1000;
      mouseY = -1000;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    const threshold = 250;
    const maxDisplacement = 150;
    const currentPositions = facesConfig.map(() => ({ x: 0, y: 0 }));

    const animate = () => {
      faceRefs.current.forEach((faceEl, index) => {
        if (!faceEl) return;

        let targetX = 0;
        let targetY = 0;

        if (isHovering) {
          const faceRect = faceEl.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          const faceCenterX = faceRect.left + faceRect.width / 2 - containerRect.left;
          const faceCenterY = faceRect.top + faceRect.height / 2 - containerRect.top;

          const dx = faceCenterX - mouseX;
          const dy = faceCenterY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < threshold && dist > 0) {
            const force = (threshold - dist) / threshold;
            const displacement = Math.pow(force, 1.4) * maxDisplacement;

            targetX = (dx / dist) * displacement;
            targetY = (dy / dist) * displacement;
          }
        }

        currentPositions[index].x += (targetX - currentPositions[index].x) * 0.08;
        currentPositions[index].y += (targetY - currentPositions[index].y) * 0.08;

        const config = facesConfig[index];
        faceEl.style.transform = `translate(${currentPositions[index].x}px, ${currentPositions[index].y}px) rotate(${config.rotate}deg)`;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="faces-container">
      {facesConfig.map((face, index) => (
        <div
          key={face.id}
          className="face-wrapper animate-levitate"
          style={{
            "--face-left": face.desktop.left,
            "--face-top": face.desktop.top,
            "--face-width": `${face.desktop.width}px`,
            "--face-left-mobile": face.mobile.left,
            "--face-top-mobile": face.mobile.top,
            "--face-width-mobile": `${face.mobile.width}px`,
            "--face-rotate": `${face.rotate}deg`,
            animationDelay: `${index * -0.5}s`,
            animationDuration: `${4 + (index % 3)}s`,
          } as FaceStyle}
        >
          <div
            ref={(el) => {
              faceRefs.current[index] = el;
            }}
            className="face-inner"
            style={{ transform: `rotate(${face.rotate}deg)` }}
          >
            <Image
              src="/images/face.png"
              alt="Twarz"
              width={face.desktop.width}
              height={Math.round(face.desktop.width * 1.295)}
              style={{ width: "100%", height: "auto" }}
              preload={index < 3}
              loading={index < 3 ? undefined : "eager"}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
