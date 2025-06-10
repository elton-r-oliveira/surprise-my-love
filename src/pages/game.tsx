import dynamic from 'next/dynamic';
import Link from 'next/link';

const GameCanvas = dynamic(() => import('../components/GameCanvas'), {
  ssr: false,
});

export default function Game() {
  return (
    <main style={{ position: 'relative' }}>
      <Link href="/" passHref>
        <button style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          padding: '10px 15px',
          background: 'rgba(255, 255, 255, 0.7)',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}>
          Voltar ao Menu
        </button>
      </Link>
      
      <h1 style={{ textAlign: 'center', marginTop: '50px', color: 'white' }}>my little 💖</h1>
      <GameCanvas />
    </main>
  );
}