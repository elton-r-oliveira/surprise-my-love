import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Feliz Dia dos Namorados! 💘</h1>
      <p>Tenho algo especial pra você...</p>
      <Link href="/game">
        <button style={{ fontSize: '20px', padding: '10px 20px' }}>
          Jogar Agora
        </button>
      </Link>
    </main>
  );
}
