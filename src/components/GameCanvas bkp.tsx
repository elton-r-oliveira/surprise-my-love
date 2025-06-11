import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { useAudio } from '../contexts/AudioContext'; // Importe o hook useAudio

const GameCanvas: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const { stopAudio } = useAudio(); // Obtenha a função stopAudio do contexto

  useEffect(() => {
    // Pare a música do menu antes de iniciar o jogo
    stopAudio();

    if (gameRef.current) return;

    const messages: string[] = [
      'Eu te amo porque você me entende como ninguém.',
      'Eu te amo porque seu sorriso ilumina tudo.',
      'Eu te amo porque ao seu lado tudo é melhor.',
    ];

    class MainScene extends Phaser.Scene {
      player!: Phaser.Physics.Arcade.Sprite;
      princess!: Phaser.Physics.Arcade.Sprite;
      hearts!: Phaser.Physics.Arcade.Group;
      cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      ground!: Phaser.Physics.Arcade.StaticGroup;
      music!: Phaser.Sound.BaseSound;
      hudText!: Phaser.GameObjects.Text;
      score: number = 0;
      background!: Phaser.GameObjects.TileSprite;

      constructor() {
        super('MainScene');
      }

      preload() {
        this.load.image('bg', '/assets/backgrounds/chao.png');
        this.load.image('platform', '/assets/backgrounds/platform.png');
        this.load.spritesheet('milin', '/assets/sprites/milin.png', {
          frameWidth: 100,  // ajuste conforme o seu sprite
          frameHeight: 95,
        });

        this.load.image('heart', '/assets/sprites/heart.png');
        this.load.spritesheet('player', '/assets/sprites/player22.png', {
          frameWidth: 65,
          frameHeight: 101,
        });
        this.load.spritesheet('princess', '/assets/sprites/princess.png', {
          frameWidth: 60,
          frameHeight: 95,
        });
        this.load.audio('bgm', '/assets/audio/bgm.mp3');
      }

      showMessage(message: string) {
        const padding = 10;
        const width = 400;
        const text = this.add.text(padding, padding, message, {
          fontSize: '18px',
          color: '#000',
          wordWrap: { width: width - padding * 2 },
          fontFamily: 'Arial',
        });

        const box = this.add.graphics();
        box.fillStyle(0xffffff, 1);
        box.fillRoundedRect(0, 0, width, text.height + padding * 2, 12);

        const container = this.add.container(this.player.x, this.player.y - 150, [box, text]);
        container.setScrollFactor(0);
        container.setDepth(1000);

        // Remove após 3 segundos
        this.time.delayedCall(3000, () => {
          container.destroy();
        });
      }

      create() {
        // Fundo infinito
        this.background = this.add.tileSprite(0, 0, 1600, 800, 'bg')
          .setOrigin(0, 0)
          .setScale(2.5)
          .setScrollFactor(0.5); // Efeito parallax

        // Música
        const audio = this.sound as Phaser.Sound.WebAudioSoundManager;
        if ('context' in audio) {
          this.music = this.sound.add('bgm', {
            loop: true,
            volume: 0.4,
          });
          this.music.play();
        }

        // HUD
        this.hudText = this.add.text(16, 16, 'Corações: 0', {
          fontSize: '24px',
          color: '#fff',
          fontFamily: 'Arial',
        }).setScrollFactor(0);

        // Chão infinito
        this.ground = this.physics.add.staticGroup();
        const groundWidth = 1600; // Largura de cada segmento do chão
        const groundSegments = 4; // Quantidade de segmentos

        for (let i = 0; i < groundSegments; i++) {
          const segment = this.ground.create(i * groundWidth, 750, '');
          segment.setSize(groundWidth, 50).setVisible(false);
        }

        // Animações
        this.anims.create({
          key: 'walk',
          frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
          frameRate: 10,
          repeat: -1,
        });

        this.anims.create({
          key: 'idle',
          frames: [{ key: 'player', frame: 0 }],
          frameRate: 1,
        });

        this.anims.create({
          key: 'princess_idle',
          frames: this.anims.generateFrameNumbers('princess', { start: 0, end: 3 }),
          frameRate: 6,
          repeat: -1,
        });

        // Grupo de corações
        this.hearts = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite });

        messages.forEach((msg, i) => {
          const heart = this.hearts.create(400 + i * 400, 500, 'heart') as Phaser.Physics.Arcade.Sprite;
          heart.setData('message', msg);
          heart.setScale(0.1);
          heart.setImmovable(true);
          (heart.body as Phaser.Physics.Arcade.Body).allowGravity = false;

          // 🩷 Animação de flutuação
          this.tweens.add({
            targets: heart,
            y: heart.y - 20,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
          });
        });

        // Player
        this.player = this.physics.add.sprite(100, 640, 'player');
        this.player.setScale(1.5);
        this.player.setCollideWorldBounds(false); // Remove limites do mundo

        // Princesa (posicionada em um local específico)
        this.princess = this.physics.add.sprite(6000, 640, 'princess');
        this.princess.setScale(1.5);
        this.princess.anims.play('princess_idle', true);
        this.princess.setImmovable(true);
        (this.princess.body as Phaser.Physics.Arcade.Body).allowGravity = false;

        // Colisões
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.princess, this.ground);
        this.physics.add.collider(this.hearts, this.ground);

        // Coração coletado
        this.physics.add.overlap(this.player, this.hearts, (_player, heart) => {
          const h = heart as Phaser.Physics.Arcade.Sprite;
          const msg = h.getData('message') as string;
          this.showMessage(msg);
          h.destroy();
          this.score += 1;
          this.updateHUD();

        });

        // Chegou na princesa
        this.physics.add.overlap(this.player, this.princess, () => {
          alert('Você chegou até mim... Eu te amo! 💖');
        });

        this.cursors = this.input.keyboard!.createCursorKeys();

        // Configuração da câmera
        this.cameras.main.setBounds(0, 0, groundWidth * groundSegments, 800);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Plataformas flutuantes
        const platforms = this.physics.add.staticGroup();

        // Plataforma com imagem
        platforms.create(1200, 200, 'platform');

        this.anims.create({
          key: 'milin_idle',
          frames: this.anims.generateFrameNumbers('milin', { start: 0, end: 3 }),
          frameRate: 6,
          repeat: -1,
        });

        const npc = this.physics.add.sprite(1200, 150, 'milin');
        npc.setScale(0.5);
        npc.anims.play('milin_idle', true);
        npc.setImmovable(true);
        (npc.body as Phaser.Physics.Arcade.Body).allowGravity = false;

        // Texto da fala
        const npcText = this.add.text(0, 0, 'Olá, aventureira! Seja bem vinda, a essa jornada AWESOME em busca de sua amada, está preparada?', {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#000',
          align: 'center',
          wordWrap: { width: 240 },
        });

        // Caixa de fundo do balão
        const bubble = this.add.graphics();
        const padding = 10;
        const textWidth = npcText.width + padding * 2;
        const textHeight = npcText.height + padding * 2;

        bubble.fillStyle(0xffffff, 1);
        bubble.fillRoundedRect(0, 0, textWidth, textHeight, 12);

        // Agrupar balão + texto
        const balloon = this.add.container(npc.x, npc.y - 120, [bubble, npcText]);
        balloon.setDepth(1);

        // Centralizar texto no fundo
        npcText.setPosition(padding, padding);

        // Fixa o balão acompanhando o NPC
        this.events.on('update', () => {
          balloon.setPosition(npc.x, npc.y - 120);
        });

        // Adiciona colisões com jogador e corações
        this.physics.add.collider(this.player, platforms);
        this.physics.add.collider(this.hearts, platforms);

        // Define limites reais do mundo para evitar travar
        this.physics.world.setBounds(0, 0, groundWidth * groundSegments, 800);
        this.player.setCollideWorldBounds(true);

      }

      update() {
        // Atualiza o background para efeito parallax
        this.background.tilePositionX = this.cameras.main.scrollX * 0.5;

        // Movimento
        if (this.cursors.left?.isDown) {
          this.player.setVelocityX(-220);
          this.player.anims.play('walk', true);
          this.player.setFlipX(true);
        } else if (this.cursors.right?.isDown) {
          this.player.setVelocityX(220);
          this.player.anims.play('walk', true);
          this.player.setFlipX(false);
        } else {
          this.player.setVelocityX(0);
          this.player.anims.play('idle', true);
        }

        // Pulo
        if ((this.cursors.up?.isDown || this.cursors.space?.isDown) && this.player.body?.blocked.down) {
          this.player.setVelocityY(-500);
        }
      }

      updateHUD() {
        this.hudText.setText(`Corações: ${this.score}`);
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1600,
      height: 800,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 1400 },
          debug: false,
        },
      },
      scene: MainScene,
      parent: 'game-container',
      audio: {
        disableWebAudio: false // Garante que o WebAudio está habilitado
      }
    };

    gameRef.current = new Phaser.Game(config);

    // Retorna uma função para destruir o jogo quando o componente for desmontado
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      id="game-container"
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
      }}
    />
  );
};

export default GameCanvas;
