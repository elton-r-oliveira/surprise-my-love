import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

type AudioContextType = {
  isPlaying: boolean;
  toggleAudio: () => void;
  initializeAudio: () => Promise<void>;
  stopAudio: () => void; // Adicionado stopAudio
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Inicializa o áudio
  useEffect(() => {
    audioRef.current = new Audio('/assets/audio/menu.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    audioRef.current.load();

    // Tenta tocar automaticamente após um pequeno delay
    const tryAutoplay = async () => {
      try {
        await audioRef.current?.play();
        setIsPlaying(true);
      } catch (err) {
        console.log('Autoplay bloqueado, aguardando interação...');
      }
    };

    const timer = setTimeout(tryAutoplay, 500);

    return () => {
      clearTimeout(timer);
      audioRef.current?.pause();
    };
  }, []);

  const initializeAudio = async () => {
    if (!userInteracted && audioRef.current && !isPlaying) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setUserInteracted(true);
      } catch (err) {
        console.log('Erro ao iniciar áudio:', err);
      }
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log('Erro ao tocar:', e));
      }
      setIsPlaying(!isPlaying);
      setUserInteracted(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset to the beginning
      setIsPlaying(false);
    }
  };

  return (
    <AudioContext.Provider value={{ isPlaying, toggleAudio, initializeAudio, stopAudio }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
