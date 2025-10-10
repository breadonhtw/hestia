import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

interface PageNotFoundProps {
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export default function PageNotFound({ onGoBack, onGoHome }: PageNotFoundProps) {
  return (
    <div className="w-full h-screen bg-background overflow-x-hidden flex justify-center items-center relative">
      <MessageDisplay onGoBack={onGoBack} onGoHome={onGoHome} />
      <CharactersAnimation />
      <CircleAnimation />
    </div>
  );
}

// 1. Message Display Component
interface MessageDisplayProps {
  onGoBack?: () => void;
  onGoHome?: () => void;
}

function MessageDisplay({ onGoBack, onGoHome }: MessageDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute flex flex-col justify-center items-center w-[90%] h-[90%] z-[100]">
      <div 
        className={`flex flex-col items-center transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="text-[35px] font-sans font-semibold text-foreground m-[1%]">
          Page Not Found
        </div>
        <div className="text-[80px] font-serif font-bold text-primary m-[1%]">
          404
        </div>
        <div className="text-[15px] w-1/2 min-w-[40%] text-center text-muted-foreground m-[1%]">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </div>
        <div className="flex gap-6 mt-8">
          <Button
            onClick={onGoBack}
            variant="outline"
            size="lg"
            className="border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 ease-in-out flex items-center gap-2 hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
          <Button
            onClick={onGoHome}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 ease-in-out flex items-center gap-2 hover:scale-105"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

// 2. Characters Animation Component
type StickFigure = {
  top?: string;
  bottom?: string;
  src: string;
  transform?: string;
  speedX: number;
  speedRotation?: number;
};

function CharactersAnimation() {
  const charactersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Define stick figures with their properties
    const stickFigures: StickFigure[] = [
      {
        top: '0%',
        src: 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick0.svg',
        transform: 'rotateZ(-90deg)',
        speedX: 1500,
      },
      {
        top: '10%',
        src: 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick1.svg',
        speedX: 3000,
        speedRotation: 2000,
      },
      {
        top: '20%',
        src: 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick2.svg',
        speedX: 5000,
        speedRotation: 1000,
      },
      {
        top: '25%',
        src: 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick0.svg',
        speedX: 2500,
        speedRotation: 1500,
      },
      {
        top: '35%',
        src: 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick0.svg',
        speedX: 2000,
        speedRotation: 300,
      },
      {
        bottom: '5%',
        src: 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick3.svg',
        speedX: 0,
      },
    ];

    if (charactersRef.current) {
      charactersRef.current.innerHTML = '';
    }

    stickFigures.forEach((figure, index) => {
      const stick = document.createElement('img');
      stick.classList.add('characters');
      stick.style.position = 'absolute';
      stick.style.width = '18%';
      stick.style.height = '18%';
      stick.style.opacity = '0.15';
      stick.style.filter = 'brightness(0) saturate(100%) invert(66%) sepia(13%) saturate(1032%) hue-rotate(358deg) brightness(92%) contrast(88%)';

      if (figure.top) stick.style.top = figure.top;
      if (figure.bottom) stick.style.bottom = figure.bottom;
      
      stick.src = figure.src;
      
      if (figure.transform) stick.style.transform = figure.transform;

      charactersRef.current?.appendChild(stick);

      if (index === 5) return;

      stick.animate(
        [{ left: '100%' }, { left: '-20%' }],
        { duration: figure.speedX, easing: 'linear', fill: 'forwards' }
      );

      if (index === 0) return;

      if (figure.speedRotation) {
        stick.animate(
          [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-360deg)' }],
          { duration: figure.speedRotation, iterations: Infinity, easing: 'linear' }
        );
      }
    });

    return () => {
      if (charactersRef.current) {
        charactersRef.current.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (charactersRef.current) {
        charactersRef.current.innerHTML = '';
        charactersRef.current.dispatchEvent(new Event('contentchanged'));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={charactersRef}
      className="absolute w-[99%] h-[95%]"
    />
  );
}

// 3. Circle Animation Component
interface Circulo {
  x: number;
  y: number;
  size: number;
}

function CircleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number>();
  const timerRef = useRef(0);
  const circulosRef = useRef<Circulo[]>([]);

  const initArr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    circulosRef.current = [];
    
    for (let index = 0; index < 300; index++) {
      const randomX = Math.floor(
        Math.random() * ((canvas.width * 3) - (canvas.width * 1.2) + 1)
      ) + (canvas.width * 1.2);
      
      const randomY = Math.floor(
        Math.random() * ((canvas.height) - (canvas.height * (-0.2) + 1))
      ) + (canvas.height * (-0.2));
      
      const size = canvas.width / 1000;
      
      circulosRef.current.push({ x: randomX, y: randomY, size });
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    timerRef.current++;
    context.setTransform(1, 0, 0, 1, 0, 0);
    
    const distanceX = canvas.width / 80;
    const growthRate = canvas.width / 1000;
    
    // Use warm gold color with opacity
    context.fillStyle = 'rgba(184, 151, 106, 0.4)';
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    circulosRef.current.forEach((circulo) => {
      context.beginPath();
      
      if (timerRef.current < 65) {
        circulo.x = circulo.x - distanceX;
        circulo.size = circulo.size + growthRate;
      }
      
      if (timerRef.current > 65 && timerRef.current < 500) {
        circulo.x = circulo.x - (distanceX * 0.02);
        circulo.size = circulo.size + (growthRate * 0.2);
      }
      
      context.arc(circulo.x, circulo.y, circulo.size, 0, 360);
      context.fill();
    });
    
    if (timerRef.current > 500) {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
      return;
    }
    
    requestIdRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    timerRef.current = 0;
    initArr();
    draw();
    
    const handleResize = () => {
      if (!canvas) return;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      timerRef.current = 0;
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
      
      const context = canvas.getContext('2d');
      if (context) {
        context.reset();
      }
      
      initArr();
      draw();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
