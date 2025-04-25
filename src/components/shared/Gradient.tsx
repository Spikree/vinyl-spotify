import { useEffect, useRef, useState } from 'react';

const Gradient = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const targetMousePosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const handleMouseMove = (e: MouseEvent) => {
      targetMousePosition.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    const animate = (timestamp: number) => {
      if (!timeRef.current) timeRef.current = timestamp;
      const elapsed = timestamp - timeRef.current;
      const time = elapsed * 0.0005; // Slower time progression
      
      if (!canvas || !ctx) return;
      
      // Smoother mouse movement
      setMousePosition(prev => ({
        x: prev.x + (targetMousePosition.current.x - prev.x) * 0.05,
        y: prev.y + (targetMousePosition.current.y - prev.y) * 0.05
      }));
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Dynamic base gradient with smoother transitions
      const gradient = ctx.createLinearGradient(
        mousePosition.x * width * 0.3,
        mousePosition.y * height * 0.3,
        width - mousePosition.x * width * 0.3,
        height - mousePosition.y * height * 0.3
      );
      gradient.addColorStop(0, '#050108'); // Darker base
      gradient.addColorStop(0.4, '#0a0215');
      gradient.addColorStop(0.6, '#120627');
      gradient.addColorStop(1, '#1a0933');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      addNoise(ctx, width, height, 15 + Math.sin(time) * 3); // Subtler noise
      drawAnimatedWaves(ctx, width, height, time, mousePosition);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  const addNoise = (ctx: CanvasRenderingContext2D, width: number, height: number, opacity: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * opacity - opacity/2;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
      data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
    }
    
    ctx.putImageData(imageData, 0, 0);
  };
  
  const drawAnimatedWaves = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    time: number, 
    mousePos: { x: number; y: number }
  ) => {
    const waveSpeed = 0.8; // Slower wave movement
    const amplitude = 0.12;
    
    const wave1Offset = Math.sin(time * waveSpeed) * amplitude;
    const wave2Offset = Math.cos(time * waveSpeed * 1.2) * amplitude;
    
    const mouseXFactor = (mousePos.x - 0.5) * 0.6;
    const mouseYFactor = (mousePos.y - 0.5) * 0.6;
    
    ctx.globalCompositeOperation = 'screen';
    
    // First wave
    ctx.beginPath();
    ctx.moveTo(0, height * (0.6 + wave1Offset + mouseYFactor));
    
    const cp1x = width * (0.3 + wave2Offset * 3 + mouseXFactor);
    const cp1y = height * (0.4 + wave1Offset * 4 - mouseYFactor);
    const cp2x = width * (0.7 - wave1Offset * 3 - mouseXFactor);
    const cp2y = height * (0.8 + wave2Offset * 3 + mouseYFactor);
    
    ctx.bezierCurveTo(
      cp1x, cp1y,
      cp2x, cp2y,
      width, height * (0.5 + wave1Offset * 1.2 - mouseYFactor)
    );
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    
    const hue1 = 260 + Math.sin(time) * 20;
    const gradient1 = ctx.createLinearGradient(0, height * 0.6, width * mousePos.x, height);
    gradient1.addColorStop(0, `hsla(${hue1}, 90%, 12%, 0.6)`);
    gradient1.addColorStop(1, `hsla(${hue1 + 20}, 90%, 3%, 0.4)`);
    ctx.fillStyle = gradient1;
    ctx.fill();
    
    // Second wave
    ctx.beginPath();
    ctx.moveTo(0, height * (0.8 - wave2Offset + mouseYFactor));
    
    const cp3x = width * (0.4 + wave1Offset * 3 - mouseXFactor * 1.5);
    const cp3y = height * (0.6 - wave2Offset * 3 + mouseYFactor);
    const cp4x = width * (0.6 - wave2Offset * 4 + mouseXFactor);
    const cp4y = height * (0.9 + wave1Offset * 1.2 - mouseYFactor);
    
    ctx.bezierCurveTo(
      cp3x, cp3y,
      cp4x, cp4y,
      width, height * (0.7 - wave1Offset * 2 + mouseYFactor)
    );
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    
    const hue2 = 250 + Math.cos(time * 1.5) * 25;
    const gradient2 = ctx.createLinearGradient(width * (1 - mousePos.x), height * 0.7, 0, height);
    gradient2.addColorStop(0, `hsla(${hue2}, 95%, 15%, 0.5)`);
    gradient2.addColorStop(1, `hsla(${hue2 - 20}, 95%, 8%, 0.4)`);
    ctx.fillStyle = gradient2;
    ctx.fill();
    
    // Mouse glow effect
    if (mousePos.x > 0 || mousePos.y > 0) {
      const pulseSize = (Math.sin(time * 4) * 0.2 + 0.8);
      const glowRadius = width * 0.3 * pulseSize;
      
      const glow = ctx.createRadialGradient(
        mousePos.x * width, mousePos.y * height, 0,
        mousePos.x * width, mousePos.y * height, glowRadius
      );
      
      const glowHue = 270 + Math.sin(time * 2) * 15;
      glow.addColorStop(0, `hsla(${glowHue}, 80%, 20%, 0.7)`);
      glow.addColorStop(0.5, `hsla(${glowHue - 10}, 80%, 12%, 0.4)`);
      glow.addColorStop(1, 'rgba(40, 10, 80, 0)');
      
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }
    
    ctx.globalCompositeOperation = 'source-over';
  };

  return (
    <canvas 
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ display: 'block' }}
    />
  );
};

export default Gradient;