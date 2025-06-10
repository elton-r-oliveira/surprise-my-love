import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const GameCanvas: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
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

      constructor() {
        super('MainScene');
      }

      preload() {
        this.load.image('bg', '/assets/backgrounds/bg.png');
        this.load.image('heart', '/assets/sprites/heart.png');
        this.load.spritesheet('player', '/assets/sprites/player.png', {
          frameWidth: 70,
          frameHeight: 101,
        });
        this.load.spritesheet('princess', '/assets/sprites/princess.png', {
          frameWidth: 60,
          frameHeight: 95,
        });
        this.load.audio('bgm', '/assets/audio/bgm.mp3');
      }

      create() {
        // Fundo (ajustado para cobrir toda a área do jogo)
        const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0);
        bg.setScale(2.5);
        bg.displayWidth = 1600;
        bg.displayHeight = 800;

        // Música (checa se é WebAudio)
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

        // Chão invisível
        this.ground = this.physics.add.staticGroup();
        const ground = this.ground.create(800, 750, '');
        ground.setSize(1600, 50).setVisible(false);

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

        messages.forEach((msg: string, i: number) => {
          const heart = this.hearts.create(400 + i * 300, 500, 'heart') as Phaser.Physics.Arcade.Sprite;
          heart.setData('message', msg);
          heart.setScale(0.1);
          heart.setImmovable(true);
          (heart.body as Phaser.Physics.Arcade.Body).allowGravity = false;
        });

        // Player
        this.player = this.physics.add.sprite(100, 640, 'player');
        this.player.setScale(1.5);
        this.player.setCollideWorldBounds(true);

        // Princesa (posicionada dentro da mesma tela)
        this.princess = this.physics.add.sprite(1200, 640, 'princess');
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
          alert(msg);
          h.destroy();
          this.score += 1;
          this.updateHUD();
        });

        // Chegou na princesa
        this.physics.add.overlap(this.player, this.princess, () => {
          alert('Você chegou até mim... Eu te amo! 💖');
        });

        this.cursors = this.input.keyboard!.createCursorKeys();

        // Configuração da câmera para seguir o jogador
        this.cameras.main.setBounds(0, 0, 1600, 800);
        this.cameras.main.startFollow(this.player);
      }

      update() {
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
    };

    gameRef.current = new Phaser.Game(config);
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