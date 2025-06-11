import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { useRouter } from 'next/router';
import AnimatedHeart from '../components/AnimatedHeart';

export default function Menu() {
    const { initializeAudio, isPlaying, toggleAudio } = useAudio();
    const [isLoading, setIsLoading] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();

    useEffect(() => {
        initializeAudio();
    }, [initializeAudio]);

    const handleStartGame = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            router.push('/game');
        }, 10000);
    };

    const handleAboutClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsTransitioning(true);

        // Animação de transição antes de redirecionar
        setTimeout(() => {
            router.push('/about');
        }, 500); // Tempo que coincide com a duração da animação
    };

    return (
        <div onClick={() => !isPlaying && initializeAudio()}>
            {/* Overlay de loading */}
            {isLoading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 1000,
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <AnimatedHeart />
                    <p style={{
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>
                        Preparando seu jogo...
                    </p>
                </div>
            )}

            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                textAlign: 'center',
                overflow: 'auto',
                boxSizing: 'border-box',
                backgroundImage: 'url(/assets/images/fundo.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                opacity: isLoading || isTransitioning ? 0.5 : 1,
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

                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    zIndex: 0,
                    opacity: isTransitioning ? 0.7 : 0.5,
                    transition: 'opacity 0.5s ease-in-out'
                }} />

                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '800px',
                    padding: '40px',
                    backdropFilter: 'blur(2px)',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    transform: isTransitioning ? 'translateY(-20px)' : 'translateY(0)',
                    transition: 'all 0.5s ease-in-out'
                }}>
                    <h1 style={{
                        fontSize: '3rem',
                        marginBottom: '20px',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        color: '#fff',
                        opacity: isTransitioning ? 0.8 : 1,
                        transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
                        transition: 'all 0.5s ease-in-out'
                    }}>
                        My Little 💖
                    </h1>

                    <p style={{
                        fontSize: '1.2rem',
                        marginBottom: '40px',
                        maxWidth: '600px',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        opacity: isTransitioning ? 0.7 : 1,
                        transition: 'opacity 0.5s ease-in-out'
                    }}>
                        Uma aventura especial para o Dia dos Namorados
                    </p>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        width: '100%'
                    }}>
                        <Link href="/game" passHref>
                            <button
                                onClick={handleStartGame}
                                disabled={isLoading}
                                style={{
                                    fontSize: '1.5rem',
                                    padding: '15px 40px',
                                    borderRadius: '50px',
                                    border: 'none',
                                    background: '#ff6b6b',
                                    color: 'white',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                    transition: 'all 0.3s',
                                    width: '100%',
                                    maxWidth: '300px',
                                    margin: '0 auto',
                                    opacity: isTransitioning ? 0.5 : 1,
                                    transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
                                }}
                            >
                                Começar Jogo
                            </button>
                        </Link>

                        <Link href="/about" passHref>
                            <button
                                onClick={handleAboutClick}
                                style={{
                                    fontSize: '1.2rem',
                                    padding: '10px 30px',
                                    borderRadius: '50px',
                                    border: '2px solid white',
                                    background: isTransitioning ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.5s ease-in-out',
                                    width: '100%',
                                    maxWidth: '300px',
                                    margin: '0 auto',
                                    transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
                                    boxShadow: isTransitioning ? '0 0 15px rgba(0, 0, 0, 0.4)' : 'none'
                                }}
                            >
                                Sobre o Jogo
                            </button>
                        </Link>
                    </div>

                    <div style={{
                        marginTop: '50px',
                        fontSize: '0.9rem',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        opacity: isTransitioning ? 0.5 : 1,
                        transition: 'opacity 0.5s ease-in-out'
                    }}>
                        <p>Feito com 💖 para você</p>
                    </div>
                </div>
            </div>
        </div>
    );
}