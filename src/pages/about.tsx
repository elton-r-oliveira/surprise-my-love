import Link from 'next/link';
import { useAudio } from '../contexts/AudioContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function About() {
    const { isPlaying, toggleAudio } = useAudio();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isPlaying) {
            toggleAudio(); // Tenta iniciar a música ao carregar
        }
    }, []);

    const handleBackToMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsTransitioning(true);
        
        // Animação de transição antes de redirecionar
        setTimeout(() => {
            router.push('/');
        }, 500); // Tempo que coincide com a duração da animação
    };
    
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
            boxSizing: 'border-box',
            opacity: isTransitioning ? 0.5 : 1,
            transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.5s ease-in-out'
        }}>
            <button
                onClick={toggleAudio}
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    zIndex: 1000,
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    fontSize: 20,
                    cursor: 'pointer',
                    transition: 'transform 0.3s',
                }}
            >
                {isPlaying ? '🔊' : '🔇'}
            </button>

            <h1 style={{ 
                fontSize: '2.5rem', 
                marginBottom: '30px',
                transform: isTransitioning ? 'translateY(-20px)' : 'translateY(0)',
                opacity: isTransitioning ? 0.7 : 1,
                transition: 'all 0.5s ease-in-out'
            }}>
                Sobre o Jogo
            </h1>

            <div style={{
                maxWidth: '800px',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '30px',
                borderRadius: '15px',
                marginBottom: '30px',
                transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)',
                opacity: isTransitioning ? 0.6 : 1,
                transition: 'all 2.5s ease-in-out'
            }}>
                <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '20px' }}>
                    "My Little 💖" é um game especial para alguém especial.
                </p>
                <p style={{ fontSize: '1.2rem', lineHeight: '0.6', marginBottom: '20px' }}>
                    Nesta aventura, você controla uma personagem em busca de sua amada,
                </p>
                <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '20px' }}>
                   coletando corações que revelam mensagens especiais..
                </p>
                <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
                    De coisinho para coisinha.
                </p>
            </div>

            {/* Imagem esquerda grudada no rodapé */}
            <div style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                height: '80%',
                width: '50%',
                backgroundImage: 'url(/assets/images/esquerda.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left bottom',
                opacity: isTransitioning ? 0.1 : 0.2,
                transition: 'opacity 2.5s ease-in-out',
                zIndex: 1
            }} />

            {/* Imagem direita grudada no rodapé */}
            <div style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                height: '100%',
                width: '40%',
                backgroundImage: 'url(/assets/images/direita.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right bottom',
                opacity: isTransitioning ? 0.1 : 0.2,
                transition: 'opacity 2.5s ease-in-out',
                zIndex: 1
            }} />

            <Link href="/" passHref>
                <button 
                    onClick={handleBackToMenu}
                    style={{
                        padding: '15px 30px',
                        fontSize: '1.2rem',
                        background: isTransitioning ? 'rgba(0, 0, 0, 0.8)' : 'white',
                        color: '#a18cd1',
                        border: 'none',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        boxShadow: isTransitioning ? '0 0 15px rgba(0, 0, 0, 0.6)' : '0 4px 8px rgba(0,0,0,0.2)',
                        transition: 'all 2.5s ease-in-out',
                        position: 'relative',
                        zIndex: 2,
                        transform: isTransitioning ? 'scale(0.95)' : 'scale(1)'
                    }}
                >
                    Voltar ao Menu
                </button>
            </Link>
        </div>
    );
}