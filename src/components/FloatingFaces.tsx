"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";

const facesConfig = [
  // 3 średnie tej samej wielkości — lewa kolumna i górny lewy róg
  { id: 1, left: "25%",  top: "12%",  width: 105, rotate: -8  },
  { id: 2, left: "6%",  top: "33%", width: 105, rotate: 5   },
  { id: 3, left: "10%",  top: "78%", width: 105, rotate: -5  },

  // Druga co do wielkości — środek
  { id: 4, left: "38%", top: "38%",  width: 152, rotate: 8   },

  // Największa — prawa strona
  { id: 5, left: "65%", top: "20%",  width: 188, rotate: -6  },

  // Mniejsze pod środkową i największą
  { id: 6, left: "30%", top: "66%", width: 82,  rotate: 10  },
  { id: 7, left: "55%", top: "78%", width: 62,  rotate: -12 },
  { id: 8, left: "78%", top: "77%", width: 92,  rotate: 6   },
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

    const threshold = 250; // Distance within which faces are repelled
    const maxDisplacement = 150; // Maximum pixels to move

    // Use current positions to interpolate for smoothness (spring-like)
    const currentPositions = facesConfig.map(() => ({ x: 0, y: 0 }));

    const animate = () => {
      faceRefs.current.forEach((faceEl, index) => {
        if (!faceEl) return;
        
        let targetX = 0;
        let targetY = 0;

        if (isHovering) {
          // Get current visual center of the face relative to container
          const faceRect = faceEl.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          const faceCenterX = (faceRect.left + faceRect.width / 2) - containerRect.left;
          const faceCenterY = (faceRect.top + faceRect.height / 2) - containerRect.top;

          const dx = faceCenterX - mouseX;
          const dy = faceCenterY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < threshold && dist > 0) {
            const force = ((threshold - dist) / threshold);
            // Power curve for smoother falloff
            const displacement = Math.pow(force, 1.4) * maxDisplacement;
            
            targetX = (dx / dist) * displacement;
            targetY = (dy / dist) * displacement;
          }
        }

        // Interpolate current position towards target
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
            left: face.left,
            top: face.top,
            width: `${face.width}px`,
            animationDelay: `${index * -0.5}s`,
            animationDuration: `${4 + (index % 3)}s`
          }}
        >
          <div
            ref={(el) => { faceRefs.current[index] = el; }}
            className="face-inner"
            style={{ transform: `rotate(${face.rotate}deg)` }}
          >
            <Image
              src="/images/face.svg"
              alt="Twarz"
              width={face.width}
              height={face.width}
              style={{ width: "100%", height: "auto" }}
              preload={index === 0}
              loading={index === 0 ? undefined : "eager"}
              fetchPriority={index === 0 ? undefined : "high"}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
