import Link from 'next/link';
import { useEffect } from 'react';

export default function Menu() {
  // Opcional: Adicionar música de menu
  useEffect(() => {
    const audio = new Audio('/assets/audio/menu-bgm.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audio.play();

    return () => {
      audio.pause();
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', // Isso garante que ocupará toda a tela
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg,rgb(255, 123, 0) 0%, #fad0c4 100%)',
      color: '#fff',
      textAlign: 'center',
      padding: '20px',
      overflow: 'auto', // Permite rolagem se o conteúdo for maior que a tela
      width: '100%',
      height: '100%',
      boxSizing: 'border-box' // Garante que o padding não some à largura/altura
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
        My little deborinhas 💖
      </h1>
      
      <p style={{ fontSize: '1.2rem', marginBottom: '40px', maxWidth: '600px' }}>
        Uma aventura especial para o Dia dos Namorados
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Link href="/game" passHref>
          <button style={{
            fontSize: '1.5rem',
            padding: '15px 40px',
            borderRadius: '50px',
            border: 'none',
            background: '#ff6b6b',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.3s',
          }}>
            Começar Jogo
          </button>
        </Link>
        
        <Link href="/about" passHref>
          <button style={{
            fontSize: '1.2rem',
            padding: '10px 30px',
            borderRadius: '50px',
            border: '2px solid white',
            background: 'transparent',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}>
            Sobre o Jogo
          </button>
        </Link>
      </div>
      
      <div style={{ marginTop: '50px', fontSize: '0.9rem' }}>
        <p>Feito com 💖 para você</p>
      </div>
    </div>
  );
}