import dynamic from 'next/dynamic';

const GameCanvas = dynamic(() => import('../components/GameCanvas'), {
  ssr: false,
});

export default function Game() {
  return (
    <main>
      <h1 style={{ textAlign: 'center', marginTop: '50px' }}>my little 💖</h1>
      <GameCanvas />
    </main>
  );
}
