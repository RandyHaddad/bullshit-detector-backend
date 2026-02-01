'use client';

import { useEffect, useRef, useState } from 'react';

interface SourceCard {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  json: string;
}

const sourceData: Omit<SourceCard, 'id'>[] = [
  {
    name: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    color: '#0A66C2',
    json: `{
  "employees": 47,
  "growth": "-12%",
  "ceo": "ex-Google",
  "cto": "contractor",
  "flag": "mismatch"
}`,
  },
  {
    name: 'Crunchbase',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
        <path d="M21.6 0H2.4A2.41 2.41 0 0 0 0 2.4v19.2A2.41 2.41 0 0 0 2.4 24h19.2a2.41 2.41 0 0 0 2.4-2.4V2.4A2.41 2.41 0 0 0 21.6 0zM7.045 14.465A2.11 2.11 0 0 1 4.94 12.36a2.11 2.11 0 0 1 2.105-2.105 2.11 2.11 0 0 1 2.105 2.105 2.11 2.11 0 0 1-2.105 2.105zm5.235 4.793a6.79 6.79 0 0 1-4.659-1.846.469.469 0 0 1 .024-.7l.924-.765a.469.469 0 0 1 .618.022 4.858 4.858 0 0 0 3.093 1.132c2.39 0 4.453-1.714 4.453-4.153V12.9c0-2.439-2.063-4.153-4.453-4.153a4.858 4.858 0 0 0-3.093 1.132.469.469 0 0 1-.618.022l-.924-.765a.469.469 0 0 1-.024-.7 6.79 6.79 0 0 1 4.659-1.846c3.574 0 6.612 2.636 6.612 6.31v.048c0 3.674-3.038 6.31-6.612 6.31z"/>
      </svg>
    ),
    color: '#0288D1',
    json: `{
  "funding": "$15M",
  "claimed": "$150M",
  "variance": "10x",
  "round": "Series A",
  "status": "INFLATED"
}`,
  },
  {
    name: 'SEC',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z"/>
        <path d="M8 12h8v2H8zm0 4h8v2H8z"/>
      </svg>
    ),
    color: '#1565C0',
    json: `{
  "filings": 0,
  "form_D": null,
  "form_S1": null,
  "status": "NOT_FOUND",
  "alert": true
}`,
  },
  {
    name: 'News',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
        <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
    ),
    color: '#7B1FA2',
    json: `{
  "mentions": 3,
  "tier1": 0,
  "sentiment": 0.4,
  "revenue_pr": false,
  "last": "2023-06"
}`,
  },
  {
    name: 'App Store',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
    color: '#E91E63',
    json: `{
  "rating": 3.2,
  "reviews": 127,
  "downloads": "10K",
  "claimed": "500K",
  "variance": "50x"
}`,
  },
  {
    name: 'G2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    color: '#FF9800',
    json: `{
  "score": 3.8,
  "reviews": 23,
  "enterprise": false,
  "competitors": 12,
  "rank": 8
}`,
  },
  {
    name: 'X',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: '#000',
    json: `{
  "followers": 2340,
  "engagement": 0.8,
  "verified": false,
  "mentions": "low",
  "sentiment": 0.5
}`,
  },
  {
    name: 'GitHub',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    color: '#6e5494',
    json: `{
  "repos": 3,
  "stars": 45,
  "forks": 12,
  "contributors": 4,
  "lastCommit": "2mo"
}`,
  },
];

export function SourceScanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cards, setCards] = useState<SourceCard[]>([]);
  const positionRef = useRef(0);
  const animationRef = useRef<number>();

  // Initialize cards
  useEffect(() => {
    const initialCards: SourceCard[] = [];
    for (let i = 0; i < 24; i++) {
      const source = sourceData[i % sourceData.length];
      initialCards.push({
        ...source,
        id: `card-${i}`,
      });
    }
    setCards(initialCards);
  }, []);

  // Particle scanner canvas effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
    };
    resize();

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      alpha: number;
      size: number;
    }> = [];

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const scannerX = w / 2;

    const createParticle = () => ({
      x: scannerX + (Math.random() - 0.5) * 4,
      y: Math.random() * h,
      vx: (Math.random() * 2 + 0.5) * (Math.random() > 0.5 ? 1 : -1),
      vy: (Math.random() - 0.5) * 0.4,
      life: 1,
      alpha: Math.random() * 0.7 + 0.3,
      size: Math.random() * 2.5 + 0.5,
    });

    for (let i = 0; i < 100; i++) {
      particles.push(createParticle());
    }

    let frameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw outer glow layers
      for (let i = 3; i >= 0; i--) {
        const spread = 20 + i * 15;
        const alpha = 0.15 - i * 0.03;
        const gradient = ctx.createLinearGradient(scannerX - spread, 0, scannerX + spread, 0);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0)');
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${alpha})`);
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(scannerX - spread, 0, spread * 2, h);
      }

      // Draw bright inner glow
      const innerGlow = ctx.createLinearGradient(scannerX - 8, 0, scannerX + 8, 0);
      innerGlow.addColorStop(0, 'rgba(196, 181, 253, 0)');
      innerGlow.addColorStop(0.5, 'rgba(196, 181, 253, 0.8)');
      innerGlow.addColorStop(1, 'rgba(196, 181, 253, 0)');
      ctx.fillStyle = innerGlow;
      ctx.fillRect(scannerX - 8, 0, 16, h);

      // Draw core line with vertical fade
      const coreGradient = ctx.createLinearGradient(0, 0, 0, h);
      coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      coreGradient.addColorStop(0.1, 'rgba(255, 255, 255, 1)');
      coreGradient.addColorStop(0.9, 'rgba(255, 255, 255, 1)');
      coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = coreGradient;
      ctx.fillRect(scannerX - 1.5, 0, 3, h);

      // Update and draw particles
      ctx.globalCompositeOperation = 'lighter';
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.006;

        if (p.life <= 0 || Math.abs(p.x - scannerX) > 80) {
          particles[i] = createParticle();
          return;
        }

        const fadeY = Math.min(p.y / 30, (h - p.y) / 30, 1);
        const fadeX = 1 - Math.abs(p.x - scannerX) / 80;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 181, 253, ${p.alpha * p.life * fadeY * fadeX})`;
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      frameId = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Rail animation with clip-path updates
  useEffect(() => {
    const rail = railRef.current;
    const container = containerRef.current;
    if (!rail || !container || cards.length === 0) return;

    const cardWidth = 180;
    const gap = 50;
    const totalWidth = cards.length * (cardWidth + gap);
    const speed = 1;

    const animate = () => {
      positionRef.current -= speed;

      if (positionRef.current < -totalWidth / 2) {
        positionRef.current = 0;
      }

      rail.style.transform = `translateX(${positionRef.current}px)`;

      // Update clip-paths based on scanner position
      const containerRect = container.getBoundingClientRect();
      const scannerX = containerRect.width / 2;

      const cardWrappers = rail.querySelectorAll('.card-wrapper');
      cardWrappers.forEach((wrapper) => {
        const wrapperEl = wrapper as HTMLElement;
        const rect = wrapperEl.getBoundingClientRect();
        const cardLeft = rect.left - containerRect.left;
        const cardRight = cardLeft + rect.width;

        const normalCard = wrapperEl.querySelector('.card-normal') as HTMLElement;
        const jsonCard = wrapperEl.querySelector('.card-json') as HTMLElement;

        if (!normalCard || !jsonCard) return;

        if (cardRight < scannerX) {
          // Card has fully passed scanner - show JSON only
          normalCard.style.clipPath = 'inset(0 0 0 100%)';
          jsonCard.style.clipPath = 'inset(0 0 0 0)';
        } else if (cardLeft > scannerX) {
          // Card hasn't reached scanner - show normal only
          normalCard.style.clipPath = 'inset(0 0 0 0)';
          jsonCard.style.clipPath = 'inset(0 0 0 100%)';
        } else {
          // Card is passing through scanner - clip from LEFT side
          // As the card moves left, the left edge passes through first
          const progress = (scannerX - cardLeft) / rect.width;
          const clipPercent = Math.max(0, Math.min(100, progress * 100));
          // Normal card hides from left as it passes through
          normalCard.style.clipPath = `inset(0 0 0 ${clipPercent}%)`;
          // JSON card reveals from left as it passes through
          jsonCard.style.clipPath = `inset(0 0 0 ${100 - clipPercent}%)`;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cards]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[300px] bg-black rounded-2xl overflow-hidden border border-purple-500/20"
    >
      {/* Scanner canvas - centered */}
      <canvas
        ref={canvasRef}
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[160px] h-full pointer-events-none z-20"
      />

      {/* Rail container */}
      <div className="absolute inset-0 flex items-center overflow-hidden">
        <div
          ref={railRef}
          className="flex items-center gap-[50px] will-change-transform"
          style={{ paddingLeft: '50%' }}
        >
          {/* Duplicate cards for seamless loop */}
          {[...cards, ...cards].map((card, index) => (
            <div
              key={`${card.id}-${index}`}
              className="card-wrapper relative flex-shrink-0 w-[180px] h-[140px]"
            >
              {/* Normal card (icon view) */}
              <div
                className="card-normal absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-3 transition-shadow duration-200"
                style={{
                  background: `linear-gradient(135deg, ${card.color}25, ${card.color}10)`,
                  border: `1px solid ${card.color}50`,
                  boxShadow: `0 4px 20px ${card.color}20`,
                  clipPath: 'inset(0 0 0 0)',
                }}
              >
                <div style={{ color: card.color }}>{card.icon}</div>
                <span className="text-white font-semibold text-sm">{card.name}</span>
              </div>

              {/* JSON card (code view) */}
              <div
                className="card-json absolute inset-0 rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  clipPath: 'inset(0 0 0 100%)',
                }}
              >
                <div className="p-3 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[10px] text-purple-400 font-mono uppercase">
                      {card.name}
                    </span>
                  </div>
                  <pre className="text-[9px] text-purple-300/90 font-mono leading-tight overflow-hidden flex-1">
                    <code>{card.json}</code>
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-4 text-[10px] text-white/30 font-mono uppercase tracking-wider z-30">
        Sources
      </div>
      <div className="absolute top-3 right-4 text-[10px] text-purple-400/50 font-mono uppercase tracking-wider z-30">
        Parsed
      </div>

      {/* Gradient overlays for fade effect */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
    </div>
  );
}
