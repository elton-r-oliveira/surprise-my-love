import Link from 'next/link';

export default function About() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      color: 'white',
      textAlign: 'center',
      overflow: 'auto',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Sobre o Jogo</h1>
      
      <div style={{
        maxWidth: '800px',
        background: 'rgba(255, 255, 255, 0.2)',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px',
      }}>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '20px' }}>
          "My Little 💖" é um jogo especial criado para celebrar o Dia dos Namorados.
        </p>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '20px' }}>
          Nesta aventura, você controla uma personagem em busca de sua amada, coletando corações que revelam mensagens especiais.
        </p>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
          Um presente digital feito com carinho e tecnologia.
        </p>
      </div>
      
      <Link href="/" passHref>
        <button style={{
          padding: '15px 30px',
          fontSize: '1.2rem',
          background: 'white',
          color: '#a18cd1',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.3s',
        }}>
          Voltar ao Menu
        </button>
      </Link>
    </div>
  );
}