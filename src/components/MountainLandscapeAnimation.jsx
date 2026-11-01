import React, { useRef, useEffect } from 'react';
import { useSensorData } from '../context/SensorContext';

export function MountainLandscapeAnimation() {
  const canvasRef = useRef(null);
  const { liveSensor, currentScenario } = useSensorData();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = Math.min(420, Math.max(280, window.innerHeight * 0.35));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Rain particles
    const rainCount = currentScenario === 'extreme' || currentScenario === 'flash_breach' ? 220 : (currentScenario === 'heavy' ? 120 : 40);
    const rainDrops = Array.from({ length: rainCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 4 + Math.random() * 8,
      length: 8 + Math.random() * 12,
      opacity: 0.2 + Math.random() * 0.5
    }));

    // River water wave phase
    let wavePhase = 0;
    let radarPulsePhase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Sky Gradient (#07111F to #101D2E)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#050B14');
      skyGrad.addColorStop(0.6, '#0B1728');
      skyGrad.addColorStop(1, '#101D2E');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 35; i++) {
        const sx = ((i * 137.5) % width);
        const sy = ((i * 93.2) % (height * 0.45));
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      // 2. Far Mountain Range (Dark Slate / Deep Navy Silhouette)
      ctx.fillStyle = '#0F1A2A';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.65);
      ctx.lineTo(width * 0.15, height * 0.38);
      ctx.lineTo(width * 0.32, height * 0.52);
      ctx.lineTo(width * 0.50, height * 0.32);
      ctx.lineTo(width * 0.72, height * 0.48);
      ctx.lineTo(width * 0.88, height * 0.35);
      ctx.lineTo(width, height * 0.6);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Far Mountain Mist
      const mistGrad = ctx.createLinearGradient(0, height * 0.35, 0, height * 0.7);
      mistGrad.addColorStop(0, 'rgba(0, 212, 255, 0)');
      mistGrad.addColorStop(1, 'rgba(0, 212, 255, 0.05)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, height * 0.35, width, height * 0.35);

      // 3. Mid Mountain Ridge (Darker Blue Navy)
      ctx.fillStyle = '#0A1320';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.72);
      ctx.lineTo(width * 0.22, height * 0.48);
      ctx.lineTo(width * 0.45, height * 0.68);
      ctx.lineTo(width * 0.68, height * 0.45);
      ctx.lineTo(width * 0.90, height * 0.65);
      ctx.lineTo(width, height * 0.75);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Sensor Station Tower on Mid Ridge Peak (at width * 0.22)
      const towerX = width * 0.22;
      const towerY = height * 0.48;

      // Tower base
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(towerX - 4, towerY);
      ctx.lineTo(towerX, towerY - 18);
      ctx.lineTo(towerX + 4, towerY);
      ctx.stroke();

      // Pulsing Radar Beacons
      radarPulsePhase = (radarPulsePhase + 0.03) % (Math.PI * 2);
      const pulseRadius = 6 + (Math.sin(radarPulsePhase) + 1) * 8;
      ctx.strokeStyle = `rgba(0, 212, 255, ${Math.max(0, 0.8 - pulseRadius / 25)})`;
      ctx.beginPath();
      ctx.arc(towerX, towerY - 18, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Blinking red beacon tip
      ctx.fillStyle = Math.sin(radarPulsePhase * 2) > 0 ? '#FF3B45' : '#00D4FF';
      ctx.beginPath();
      ctx.arc(towerX, towerY - 18, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Second Sensor on Right Peak
      const tower2X = width * 0.68;
      const tower2Y = height * 0.45;
      ctx.strokeStyle = '#20D69A';
      ctx.beginPath();
      ctx.moveTo(tower2X - 4, tower2Y);
      ctx.lineTo(tower2X, tower2Y - 16);
      ctx.lineTo(tower2X + 4, tower2Y);
      ctx.stroke();
      ctx.fillStyle = '#20D69A';
      ctx.beginPath();
      ctx.arc(tower2X, tower2Y - 16, 2, 0, Math.PI * 2);
      ctx.fill();

      // 4. Foreground Ravine Valley (Deepest Night Silhouette)
      ctx.fillStyle = '#060D17';
      // Left cliff
      ctx.beginPath();
      ctx.moveTo(0, height * 0.8);
      ctx.lineTo(width * 0.35, height * 0.78);
      ctx.lineTo(width * 0.38, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Right cliff
      ctx.beginPath();
      ctx.moveTo(width * 0.65, height * 0.8);
      ctx.lineTo(width, height * 0.76);
      ctx.lineTo(width, height);
      ctx.lineTo(width * 0.62, height);
      ctx.closePath();
      ctx.fill();

      // 5. River Flowing Through the Valley (Animated Water Surface)
      wavePhase += 0.04;
      const waterLevelOffset = Math.min(45, (liveSensor?.water_level || 1.34) * 8);
      const riverBaseY = height * 0.88 - waterLevelOffset;

      const riverGrad = ctx.createLinearGradient(0, riverBaseY, 0, height);
      if (liveSensor?.water_level >= 3.5) {
        riverGrad.addColorStop(0, 'rgba(255, 59, 69, 0.85)'); // Warning red surge
        riverGrad.addColorStop(0.3, 'rgba(255, 159, 67, 0.7)');
        riverGrad.addColorStop(1, 'rgba(16, 29, 46, 0.95)');
      } else {
        riverGrad.addColorStop(0, 'rgba(0, 212, 255, 0.85)'); // Radiant cyan water
        riverGrad.addColorStop(0.3, 'rgba(0, 150, 255, 0.6)');
        riverGrad.addColorStop(1, 'rgba(10, 30, 60, 0.95)');
      }

      ctx.fillStyle = riverGrad;
      ctx.beginPath();
      ctx.moveTo(width * 0.35, height * 0.8);

      // Sine wave surface
      for (let x = width * 0.35; x <= width * 0.65; x += 10) {
        const wave = Math.sin((x * 0.04) + wavePhase) * 3 + Math.cos((x * 0.08) - wavePhase * 1.5) * 2;
        ctx.lineTo(x, riverBaseY + wave);
      }

      ctx.lineTo(width * 0.65, height);
      ctx.lineTo(width * 0.35, height);
      ctx.closePath();
      ctx.fill();

      // River currents / foam lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      for (let l = 0; l < 3; l++) {
        const lineY = riverBaseY + 8 + l * 12;
        if (lineY < height) {
          ctx.beginPath();
          for (let x = width * 0.38; x <= width * 0.62; x += 15) {
            const flowOffset = Math.sin((x * 0.05) + wavePhase * 2 + l) * 2;
            ctx.lineTo(x, lineY + flowOffset);
          }
          ctx.stroke();
        }
      }

      // 6. Rainfall Simulation
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < rainDrops.length; i++) {
        const drop = rainDrops[i];
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        drop.x -= 1; // Wind angle
        if (drop.y > height) {
          drop.y = -10;
          drop.x = Math.random() * width;
        }
      }

      // 7. Dynamic Telemetry HUD overlay in the top-right corner of the canvas
      ctx.fillStyle = 'rgba(16, 29, 46, 0.85)';
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(width - 240, 16, 224, 72, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 10px -apple-system, sans-serif';
      ctx.fillText('LIVE VALLEY HYDROMETRY', width - 226, 32);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px -apple-system, sans-serif';
      ctx.fillText(`Water: ${liveSensor?.water_level || 1.34}m`, width - 226, 52);

      ctx.fillStyle = '#00D4FF';
      ctx.font = 'bold 13px -apple-system, sans-serif';
      ctx.fillText(`Rain: ${liveSensor?.rainfall || 5.4} mm/h`, width - 120, 52);

      ctx.fillStyle = liveSensor?.water_level >= 3.5 ? '#FF3B45' : '#20D69A';
      ctx.font = '600 10px -apple-system, sans-serif';
      const statusText = liveSensor?.water_level >= 3.5 ? 'CRITICAL SURGE DETECTED' : 'RIVER FLOW NOMINAL';
      ctx.fillText(`• ${statusText}`, width - 226, 72);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [liveSensor, currentScenario]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#1E2D42] shadow-2xl bg-[#07111F]">
      <canvas ref={canvasRef} className="w-full block" />
      {/* Subtle overlay gradient at bottom to blend with page */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#07111F] to-transparent pointer-events-none" />
      {/* Badge in top left */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101D2E]/90 border border-[#1E2D42] backdrop-blur-md text-[11px] font-semibold text-slate-300">
        <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-ping" />
        <span>Continuous IoT Sensor Telemetry • Real-Time Physics Canvas</span>
      </div>
    </div>
  );
}
