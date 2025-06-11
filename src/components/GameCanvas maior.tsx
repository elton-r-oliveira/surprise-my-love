import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { useAudio } from '../contexts/AudioContext';

const GameCanvas: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const { stopAudio } = useAudio();

  useEffect(() => {
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
      enemies!: Phaser.Physics.Arcade.Group;
      attackHitbox!: Phaser.Physics.Arcade.Sprite;
      isAttacking: boolean = false;
      lastAttackTime: number = 0;
      attackCooldown: number = 500; // 0.5 segundos
      health: number = 3;
      healthText!: Phaser.GameObjects.Text;
      gameOver: boolean = false;
      isInvincible: boolean = false;
      invincibilityDuration: number = 1000; // 1 segundo de invencibilidade
      lastDamageTime: number = 0;

      constructor() {
        super('MainScene');
      }

      preload() {
        this.load.image('bg', '/assets/backgrounds/chao.png');
        this.load.image('platform', '/assets/backgrounds/platform.png');
        this.load.spritesheet('milin', '/assets/sprites/milin.png', {
          frameWidth: 100,
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
        this.load.spritesheet('enemy', '/assets/sprites/enemy.png', { // Adicione um sprite para inimigos
          frameWidth: 64,
          frameHeight: 64,
        });
        this.load.spritesheet('attack', '/assets/sprites/attack.png', { // Sprite para o ataque
          frameWidth: 100,
          frameHeight: 100,
        });
        this.load.audio('bgm', '/assets/audio/bgm.mp3');
        this.load.audio('attackSound', '/assets/audio/attack.mp3'); // Som de ataque
        this.load.audio('hitSound', '/assets/audio/hit.mp3'); // Som de dano
      }

      create() {
        // RESETAR TODAS AS VARIÁVEIS DE ESTADO
        this.score = 0;
        this.health = 3;
        this.gameOver = false;
        this.isAttacking = false;
        this.lastAttackTime = 0;

        // Configuração inicial
        this.background = this.add.tileSprite(0, 0, 1600, 800, 'bg')
          .setOrigin(0, 0)
          .setScale(2.5)
          .setScrollFactor(0.5);

        // Música - sempre criar nova instância
        if (this.music) {
          this.music.stop();
          this.music.destroy();
        }
        this.music = this.sound.add('bgm', { loop: true, volume: 0.4 });
        this.music.play();

        // // HUD - atualizar com valores iniciais
        // this.hudText = this.add.text(16, 16, 'Corações: 0', {
        //   fontSize: '24px',
        //   color: '#fff',
        //   fontFamily: 'Arial',
        // }).setScrollFactor(0);

        // this.healthText = this.add.text(16, 50, 'Vidas: 3', {
        //   fontSize: '24px',
        //   color: '#fff',
        //   fontFamily: 'Arial',
        // }).setScrollFactor(0);

        // Configuração inicial
        this.background = this.add.tileSprite(0, 0, 1600, 800, 'bg')
          .setOrigin(0, 0)
          .setScale(2.5)
          .setScrollFactor(0.5);

        // Música
        const audio = this.sound as Phaser.Sound.WebAudioSoundManager;
        if (!this.music || !this.music.isPlaying) {
          this.music = this.sound.add('bgm', { loop: true, volume: 0.4 });
          this.music.play();
        }

        // HUD
        this.hudText = this.add.text(16, 16, 'Corações: 0', {
          fontSize: '24px',
          color: '#fff',
          fontFamily: 'Arial',
        }).setScrollFactor(0);

        this.healthText = this.add.text(16, 50, 'Vidas: 3', {
          fontSize: '24px',
          color: '#fff',
          fontFamily: 'Arial',
        }).setScrollFactor(0);

        // Chão
        // Chão com altura ajustada para 600 (mais alto que 750 original)
        this.ground = this.physics.add.staticGroup();
        const groundWidth = 1600;
        const groundSegments = 4;
        const groundHeight = 640; // Mantenha esse valor (que parece correto para a princesa)

        for (let i = 0; i < groundSegments; i++) {
          const segment = this.ground.create(i * groundWidth, groundHeight, '');
          segment.setSize(groundWidth, 50).setVisible(false).setOrigin(0, 0);
          segment.refreshBody(); // essencial para atualizar corpo estático
        }


        // Animações do jogador
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
          key: 'attack',
          frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }), // Ajuste para frames de ataque
          frameRate: 15,
        });

        // Animações da princesa
        this.anims.create({
          key: 'princess_idle',
          frames: this.anims.generateFrameNumbers('princess', { start: 0, end: 3 }),
          frameRate: 6,
          repeat: -1,
        });

        // Animações do inimigo
        this.anims.create({
          key: 'enemy_walk',
          frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 0 }),
          frameRate: 6,
          repeat: -1,
        });

        this.anims.create({
          key: 'enemy_hit',
          frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 0 }),
          frameRate: 10,
        });

        // Grupo de corações
        this.hearts = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite });

        messages.forEach((msg, i) => {
          const heart = this.hearts.create(400 + i * 400, 500, 'heart') as Phaser.Physics.Arcade.Sprite;
          heart.setData('message', msg);
          heart.setScale(0.1);
          heart.setImmovable(true);
          (heart.body as Phaser.Physics.Arcade.Body).allowGravity = false;

          // Verificação antes de adicionar o tween
          if (heart) {
            this.tweens.add({
              targets: heart,
              y: heart.y - 20,
              duration: 1000,
              ease: 'Sine.easeInOut',
              yoyo: true,
              repeat: -1,
            });
          } else {
            console.warn("Heart is undefined, cannot add tween.");
          }
        });

        // Player
        this.player = this.physics.add.sprite(100, groundHeight - 100, 'player');
        // groundHeight - 100 para ficar em cima do chão (ajuste o 100 conforme o tamanho do sprite)
        this.player.setScale(1.5);
        this.player.setCollideWorldBounds(true, undefined, undefined, true);
        (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        (this.player.body as Phaser.Physics.Arcade.Body).setSize(40, 80); // Ajuste para o tamanho real do player
        (this.player.body as Phaser.Physics.Arcade.Body).setOffset(10, 10); // Ajuste conforme necessário

        // Hitbox de ataque (invisível inicialmente)
        this.attackHitbox = this.physics.add.sprite(0, 0, 'attack');
        this.attackHitbox.setVisible(false);
        this.attackHitbox.setActive(false);

        // Configurações importantes para o hitbox:
        this.attackHitbox.setGravityY(0); // Desativa a gravidade
        this.attackHitbox.setImmovable(true); // Não é afetado por colisões
        (this.attackHitbox.body as Phaser.Physics.Arcade.Body).allowGravity = false; // Garante que não caia
        (this.attackHitbox.body as Phaser.Physics.Arcade.Body).setSize(80, 60);

        // Princesa
        this.princess = this.physics.add.sprite(5000, 640, 'princess');
        this.princess.setScale(1.5);
        this.princess.anims.play('princess_idle', true);
        this.princess.setImmovable(true);
        (this.princess.body as Phaser.Physics.Arcade.Body).allowGravity = false;

        // Inimigos
        this.enemies = this.physics.add.group();
        this.spawnEnemies();

        // Colisões
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.princess, this.ground);
        this.physics.add.collider(this.hearts, this.ground);
        this.physics.add.collider(this.enemies, this.ground);

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

        // Colisão com inimigos
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
          if (!this.isAttacking) {
            this.takeDamage();
            this.knockback(player as Phaser.Physics.Arcade.Sprite, enemy as Phaser.Physics.Arcade.Sprite);
          }
        });

        // Ataque contra inimigos
        this.physics.add.overlap(this.attackHitbox, this.enemies, (hitbox, enemy) => {
          const e = enemy as Phaser.Physics.Arcade.Sprite;
          e.anims.play('enemy_hit', true);
          e.setTint(0xff0000); // Efeito de dano

          this.time.delayedCall(200, () => {
            e.clearTint();
          });

          this.time.delayedCall(500, () => {
            e.destroy();
            this.sound.play('hitSound');
          });
        });

        this.cursors = this.input.keyboard!.createCursorKeys();

        // Tecla de ataque (tecla X ou Shift)
        this.input.keyboard?.on('keydown-X', this.attack, this);
        this.input.keyboard?.on('keydown-SHIFT', this.attack, this);

        // Câmera
        this.cameras.main.setBounds(0, 0, groundWidth * groundSegments, 800);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Plataformas
        const platforms = this.physics.add.staticGroup();
        platforms.create(1200, 200, 'platform');

        // NPC
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

        // Diálogo NPC
        const npcText = this.add.text(0, 0, 'Cuidado com os inimigos! Use X ou Shift para atacar!', {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#000',
          align: 'center',
          wordWrap: { width: 240 },
        });

        const bubble = this.add.graphics();
        const padding = 10;
        const textWidth = npcText.width + padding * 2;
        const textHeight = npcText.height + padding * 2;

        bubble.fillStyle(0xffffff, 1);
        bubble.fillRoundedRect(0, 0, textWidth, textHeight, 12);

        const balloon = this.add.container(npc.x, npc.y - 120, [bubble, npcText]);
        balloon.setDepth(1);
        npcText.setPosition(padding, padding);

        this.events.on('update', () => {
          balloon.setPosition(npc.x, npc.y - 120);
        });

        // Física
        this.physics.add.collider(this.player, platforms);
        this.physics.add.collider(this.hearts, platforms);
        this.physics.add.collider(this.enemies, platforms);
        this.physics.world.setBounds(0, 0, groundWidth * groundSegments, 800, true, true, true, true);
        this.player.setCollideWorldBounds(true, undefined, undefined, true);
      }

      spawnEnemies() {
        // Posições onde os inimigos vão aparecer
        const enemyPositions = [
          { x: 800, y: 500 },
          { x: 1500, y: 500 },
          { x: 2200, y: 500 },
          { x: 3000, y: 500 },
          { x: 4500, y: 500 }
        ];

        enemyPositions.forEach(pos => {
          const enemy = this.enemies.create(pos.x, pos.y, 'enemy') as Phaser.Physics.Arcade.Sprite;
          enemy.setScale(1.5);
          enemy.setCollideWorldBounds(true);
          enemy.setBounce(0.2);
          if (enemy.body) {
            enemy.setVelocityX(Phaser.Math.Between(-50, 50));
          }

          // Adicione esta verificação de segurança
          if (enemy && enemy.anims) {
            enemy.anims.play('enemy_walk', true);
          } else {
            console.warn("Enemy or enemy.anims is undefined, cannot play animation.");
          }

          // Inteligência simples: muda de direção periodicamente
          this.time.addEvent({
            delay: Phaser.Math.Between(2000, 4000),
            callback: () => {
              if (!enemy.active || !enemy.body) return;

              enemy.setVelocityX(enemy.body!.velocity.x * -1); // Use ! apenas se tiver certeza
              if (enemy.body.velocity.x > 0) {
                enemy.setFlipX(false);
              } else {
                enemy.setFlipX(true);
              }
            },
            loop: true
          });
        });
      }

      attack() {
        const now = this.time.now;

        // Verifica cooldown
        if (now - this.lastAttackTime < this.attackCooldown || this.isAttacking) {
          return;
        }

        this.isAttacking = true;
        this.lastAttackTime = now;
        this.sound.play('attackSound');

        // Posiciona a hitbox de ataque na frente do jogador
        const direction = this.player.flipX ? -1 : 1;
        this.attackHitbox.enableBody(true, this.player.x + (direction * 60), this.player.y, true, true);
        this.attackHitbox.setVisible(true);
        this.attackHitbox.setActive(true);

        // Animação de ataque
        this.player.anims.play('attack', true);

        // Desativa a hitbox após um tempo
        this.time.delayedCall(300, () => {
          this.attackHitbox.disableBody(true, true); // Desativa completamente o corpo físico
          this.isAttacking = false;
        });
      }

      takeDamage() {
        const now = this.time.now;

        // Verifica se está invencível ou se o tempo de invencibilidade ainda não acabou
        if (this.gameOver || this.isInvincible || now - this.lastDamageTime < this.invincibilityDuration) {
          return;
        }

        this.health -= 1;
        this.lastDamageTime = now;
        this.healthText.setText(`Vidas: ${this.health}`);
        this.sound.play('hitSound');

        // Ativa invencibilidade
        this.isInvincible = true;

        // Efeito visual de dano (piscar)
        const blinkInterval = 100; // tempo entre piscadas em ms
        const blinkCount = 5; // número de piscadas
        let blinkTimer = 0;

        const timer = this.time.addEvent({
          delay: blinkInterval,
          callback: () => {
            if (blinkTimer % 2 === 0) {
              this.player.setTint(0xff0000);
            } else {
              this.player.clearTint();
            }
            blinkTimer++;

            if (blinkTimer >= blinkCount * 2) {
              this.player.clearTint();
              this.isInvincible = false;
              timer.destroy();
            }
          },
          callbackScope: this,
          loop: true
        });

        if (this.health <= 0) {
          this.gameOver = true;
          this.player.setTint(0xff0000);
          this.player.setVelocity(0, 0);
          this.player.anims.stop();

          // Para a música antes de reiniciar
          if (this.music) {
            this.music.stop();
          }

          this.time.delayedCall(1000, () => {
            // Destruir todos os objetos antes de reiniciar
            this.children.each(child => {
              if (child instanceof Phaser.GameObjects.GameObject) {
                child.destroy();
              }
            });

            // Reiniciar a cena
            this.scene.restart();
          });
        } else {
          // Apenas knockback se não for game over
          this.knockback(this.player, this.enemies.getChildren()[0] as Phaser.Physics.Arcade.Sprite);
        }
      }

      knockback(player: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
        if (!player.body || !enemy.body) return;

        const direction = player.x < enemy.x ? -1 : 1;
        player.setVelocityX(direction * -300);
        player.setVelocityY(-200);
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

        this.time.delayedCall(3000, () => {
          container.destroy();
        });
      }

      update() {
        if (this.gameOver) return;

        // Impede que o player caia para fora do mapa
        if (this.player.y > 800) {
          this.player.setY(750);
          this.player.setVelocityY(0);
        }

        this.background.tilePositionX = this.cameras.main.scrollX * 0.5;

        // Movimento
        if (!this.isAttacking) {
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
            if (!this.isAttacking) {
              this.player.anims.play('idle', true);
            }
          }
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
        disableWebAudio: false
      }
    };

    gameRef.current = new Phaser.Game(config);

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
