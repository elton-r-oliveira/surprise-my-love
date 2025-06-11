import dynamic from 'next/dynamic';
import Link from 'next/link';

const GameCanvas = dynamic(() => import('../components/GameCanvas'), {
  ssr: false,
});

export default function Game() {
  return (
    <main style={{
      margin: 0,
      padding: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#111' // Mesma cor do fundo do jogo
    }}>
      <Link href="/" passHref>
        <button style={{
          position: 'absolute',
          top: '20px',
          right: '40px', // Mude de 'left' para 'right'
          zIndex: 1000,
          padding: '10px 15px',
          background: 'rgba(255, 136, 0, 0.7)',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}>
          Voltar ao Menu
        </button>
      </Link>

      {/* <h1 style={{ textAlign: 'center', marginTop: '20px', color: 'red' }}>my little 💖</h1> */}
      <GameCanvas />
    </main>
  );
}