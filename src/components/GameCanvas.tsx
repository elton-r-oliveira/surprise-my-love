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
      lifeHearts!: Phaser.GameObjects.Group;
      clouds!: Phaser.GameObjects.Group;
      currentDialogueIndex: number = 0;
      npcDialogues: string[] = [
        "Cuidado com os inimigos!",
        "Use X ou Shift para atacar!",
        "Colete todas as notas para a princesa!",
        "Pule sobre as plataformas para encontrar atalhos!"
      ];
      dialogueText!: Phaser.GameObjects.Text;
      dialogueContainer!: Phaser.GameObjects.Container;
      isTyping: boolean = false;
      currentDialogue: string = "";
      dialogueTimer!: Phaser.Time.TimerEvent;
      typingTimer!: Phaser.Time.TimerEvent;

      constructor() {
        super('MainScene');
      }

      preload() {
        this.load.image('sky', '/assets/backgrounds/sky.png');
        this.load.image('cloud', '/assets/backgrounds/cloud.png');
        this.load.image('bg', '/assets/backgrounds/background.png');
        this.load.image('platform', '/assets/backgrounds/platform.png');
        this.load.spritesheet('milin', '/assets/sprites/milin.png', {
          frameWidth: 100,
          frameHeight: 95,
        });
        this.load.image('heart', '/assets/sprites/heart.png');
        this.load.image('papel', '/assets/sprites/papel.png');
        this.load.spritesheet('player', '/assets/sprites/player22.png', {
          frameWidth: 65,
          frameHeight: 101,
        });
        this.load.spritesheet('princess', '/assets/sprites/princess.png', {
          frameWidth: 60,
          frameHeight: 95,
        });
        this.load.spritesheet('enemy', '/assets/sprites/aranha.png', { // Adicione um sprite para inimigos
          frameWidth: 233,
          frameHeight: 100,
        });
        this.load.spritesheet('enemyHit', '/assets/sprites/aranhaHit.png', { // Adicione um sprite para inimigos
          frameWidth: 206,
          frameHeight: 149,
        });
        this.load.spritesheet('attack', '/assets/sprites/attack.png', { // Sprite para o ataque
          frameWidth: 160,
          frameHeight: 154,
        });

        this.load.audio('bgm', '/assets/audio/bgm.mp3');
        this.load.audio('attackSound', '/assets/audio/attack.mp3'); // Som de ataque
        this.load.audio('hitSound', '/assets/audio/hit.mp3'); // Som de dano
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

        const sky = this.add.image(0, 0, 'sky')
          .setOrigin(0, 0)
          .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
          .setScrollFactor(0)
          .setDepth(-1); // Garante que fique atrás de tudo
        // Grupo de nuvens
        this.clouds = this.add.group();

        // Criar várias nuvens em posições aleatórias
        for (let i = 0; i < 10; i++) {
          const x = Phaser.Math.Between(-100, this.scale.width + 100);
          const y = Phaser.Math.Between(50, 300);
          const scale = Phaser.Math.FloatBetween(0.2, 0.5);
          const speed = Phaser.Math.FloatBetween(0.2, 2.5);

          const cloud = this.add.image(x, y, 'cloud')
            .setScale(scale)
            .setAlpha(0.8) // Leve transparência
            .setScrollFactor(0); // Ou um valor baixo como 0.1 para parallax

          // Adiciona dados de velocidade para cada nuvem
          cloud.setData('speed', speed);
          this.clouds.add(cloud);
        }
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
        this.hudText = this.add.text(16, 16, 'Notas Coletadas: 0', {
          fontSize: '24px',
          color: '#fff',
          fontFamily: 'Arial',
        }).setScrollFactor(0);

        // this.healthText = this.add.text(16, 50, 'Vidas: 3', {
        //   fontSize: '24px',
        //   color: '#fff',
        //   fontFamily: 'Arial',
        // }).setScrollFactor(0);

        this.lifeHearts = this.add.group();

        const heartScale = 0.08; // Tamanho menor que o anterior (0.15)
        const heartSpacing = 55; // Espaço entre os corações
        const startX = 50; // Posição X inicial
        const posY = 50; // Posição Y

        // Cria 3 corações (um para cada vida)
        for (let i = 0; i < 3; i++) {
          const heart = this.add.image(startX + i * heartSpacing, posY, 'heart')
            .setScrollFactor(0)
            .setScale(heartScale)
            .setOrigin(0, 0); // Alinha pela esquerda
          this.lifeHearts.add(heart);
        }

        // Chão infinito
        this.ground = this.physics.add.staticGroup();
        const groundWidth = 1600; // Largura de cada segmento do chão
        const groundSegments = 4; // Quantidade de segmentos

        for (let i = 0; i < groundSegments; i++) {
          const segment = this.ground.create(i * groundWidth, 720, '');
          segment.setSize(groundWidth, 50).setVisible(false);
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
          key: 'attack_anim', // Mudei o nome para evitar conflito
          frames: this.anims.generateFrameNumbers('attack', { start: 0, end: 6 }), // De 0 a 6 são 7 frames
          frameRate: 10, // Aumentei o frameRate para a animação ser mais visível
          repeat: 0, // Só executa uma vez
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
          frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 8 }),
          frameRate: 6,
          repeat: -1,
        });

        this.anims.create({
          key: 'enemy_hit',
          frames: this.anims.generateFrameNumbers('enemyHit', { start: 0, end: 4 }),
          frameRate: 10,
        });

        // Grupo de corações
        this.hearts = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite });

        messages.forEach((msg, i) => {
          const heart = this.hearts.create(400 + i * 400, 500, 'papel') as Phaser.Physics.Arcade.Sprite;
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
        this.player = this.physics.add.sprite(100, 550, 'player');
        // groundHeight - 100 para ficar em cima do chão (ajuste o 100 conforme o tamanho do sprite)
        this.player.setScale(1.5);
        this.player.setCollideWorldBounds(true, undefined, undefined, true);
        (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        (this.player.body as Phaser.Physics.Arcade.Body).setSize(40, 80); // Ajuste para o tamanho real do player
        (this.player.body as Phaser.Physics.Arcade.Body).setOffset(10, 10); // Ajuste conforme necessário

        // Hitbox de ataque (invisível inicialmente)
        // No método create():
        this.attackHitbox = this.physics.add.sprite(0, 0, 'attack');
        this.attackHitbox.setVisible(false);
        this.attackHitbox.setActive(false);
        this.attackHitbox.setScale(1.5); // Ajuste a escala conforme necessário
        this.attackHitbox.setDepth(10); // Garante que fique acima de outros sprites

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

        // Criação do balão de diálogo
        this.createDialogueBubble(npc);

        // Configura o timer para mudar os diálogos
        this.dialogueTimer = this.time.addEvent({
          delay: 4000, // Muda a cada 4 segundos
          callback: this.nextDialogue,
          callbackScope: this,
          loop: true
        });

        // Mostra o primeiro diálogo
        this.showDialogue(this.npcDialogues[0]);

        this.showDialogue(this.npcDialogues[this.currentDialogueIndex]);

        // Física
        this.physics.add.collider(this.player, platforms);
        this.physics.add.collider(this.hearts, platforms);
        this.physics.add.collider(this.enemies, platforms);
        this.physics.world.setBounds(0, 0, groundWidth * groundSegments, 800, true, true, true, true);
        this.player.setCollideWorldBounds(true, undefined, undefined, true);

        // No método create(), adicione no final:
        this.events.on('restart', () => {
          this.lifeHearts.clear(true, true);
          for (let i = 0; i < 3; i++) {
            const heart = this.add.image(16 + i * 30, 50, 'heart')
              .setScrollFactor(0)
              .setScale(0.15);
            this.lifeHearts.add(heart);
          }
        });
      }
      createDialogueBubble(npc: Phaser.Physics.Arcade.Sprite) {
        // Cria o texto do diálogo (inicialmente vazio)
        this.dialogueText = this.add.text(0, 0, "", {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#000',
          align: 'center',
          wordWrap: { width: 240 }
        });

        // Cria o balão de fala
        const bubble = this.add.graphics();
        const padding = 10;
        const textWidth = 260; // Largura fixa para o balão
        const textHeight = this.dialogueText.height + padding * 2;

        bubble.fillStyle(0xffffff, 1);
        bubble.fillRoundedRect(0, 0, textWidth, textHeight, 12);

        // Cria o container que agrupa balão e texto
        this.dialogueContainer = this.add.container(npc.x, npc.y - 120, [bubble, this.dialogueText]);
        this.dialogueContainer.setDepth(1);
        this.dialogueText.setPosition(padding, padding);

        // Atualiza a posição do balão conforme o NPC se move
        this.events.on('update', () => {
          this.dialogueContainer.setPosition(npc.x, npc.y - 90);

          // Redimensiona o balão conforme o texto aumenta
          const newHeight = this.dialogueText.height + padding * 2;
          bubble.clear();
          bubble.fillStyle(0xffffff, 1);
          bubble.fillRoundedRect(0, 0, textWidth, newHeight, 12);
        });
      }

      showDialogue(text: string) {
        // Limpa qualquer animação de digitação em andamento
        if (this.typingTimer) {
          this.typingTimer.destroy();
        }

        this.currentDialogue = text;
        this.dialogueText.setText("");
        this.isTyping = true;

        let i = 0;
        this.typingTimer = this.time.addEvent({
          delay: 50, // Velocidade da digitação (50ms por letra)
          callback: () => {
            // Adiciona apenas uma letra por vez
            this.dialogueText.setText(this.currentDialogue.substring(0, i + 1));
            i++;

            if (i >= this.currentDialogue.length) {
              this.isTyping = false;
              // Não destruímos o timer imediatamente para evitar problemas
            }
          },
          callbackScope: this,
          repeat: text.length - 1
        });
      }

      nextDialogue() {
        // Só avança se não estiver digitando
        if (this.isTyping) {
          // Se estiver digitando, completa o texto imediatamente
          this.typingTimer.destroy();
          this.dialogueText.setText(this.currentDialogue);
          this.isTyping = false;

          // Espera um pouco antes de mostrar o próximo diálogo
          this.time.delayedCall(500, () => {
            this.advanceToNextDialogue();
          });
          return;
        }

        this.advanceToNextDialogue();
      }

      advanceToNextDialogue() {
        this.currentDialogueIndex++;
        if (this.currentDialogueIndex >= this.npcDialogues.length) {
          this.currentDialogueIndex = 0;
        }

        this.showDialogue(this.npcDialogues[this.currentDialogueIndex]);
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
          enemy.setScale(1.0);
          enemy.setCollideWorldBounds(true);
          enemy.setBounce(0.2);
          if (enemy.body) {
            enemy.setVelocityX(Phaser.Math.Between(-20, 20));
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

        if (now - this.lastAttackTime < this.attackCooldown || this.isAttacking) {
          return;
        }

        this.isAttacking = true;
        this.lastAttackTime = now;
        this.sound.play('attackSound');

        // Calcula a posição baseada na direção do jogador
        const direction = this.player.flipX ? -1 : 1;
        const offsetX = direction * 120; // Aumente este valor para colocar mais à frente
        const offsetY = 10; // Ajuste para posicionar verticalmente

        this.attackHitbox.enableBody(true, this.player.x + offsetX, this.player.y + offsetY, true, true);

        // Ajusta o flip do ataque para corresponder à direção do jogador
        this.attackHitbox.setFlipX(this.player.flipX);

        this.attackHitbox.setVisible(true);
        this.attackHitbox.setActive(true);
        this.attackHitbox.play('attack_anim');

        // Animação do jogador (opcional)
        this.player.anims.play('attack', true);

        this.attackHitbox.on('animationcomplete', () => {
          this.attackHitbox.disableBody(true, true);
          this.isAttacking = false;
          this.attackHitbox.off('animationcomplete');
        });

        this.time.delayedCall(500, () => {
          if (this.isAttacking) {
            this.attackHitbox.disableBody(true, true);
            this.isAttacking = false;
          }
        });
      }

      takeDamage() {
        const now = this.time.now;

        if (this.gameOver || this.isInvincible || now - this.lastDamageTime < this.invincibilityDuration) {
          return;
        }

        this.health -= 1;
        this.lastDamageTime = now;
        this.sound.play('hitSound');

        // Remove o último coração visível
        const hearts = this.lifeHearts.getChildren();
        if (hearts.length > 0) {
          const lastHeart = hearts[hearts.length - 1] as Phaser.GameObjects.Image;
          lastHeart.destroy();
        }

        // Restante do método permanece igual...
        this.isInvincible = true;

        const blinkInterval = 100;
        const blinkCount = 5;
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

          if (this.music) {
            this.music.stop();
          }

          this.time.delayedCall(1000, () => {
            this.children.each(child => {
              if (child instanceof Phaser.GameObjects.GameObject) {
                child.destroy();
              }
            });
            this.scene.restart();
          });
        } else {
          this.knockback(this.player, this.enemies.getChildren()[0] as Phaser.Physics.Arcade.Sprite);
        }
      }

      knockback(player: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
        if (!player.body || !enemy.body) return;

        const direction = player.x < enemy.x ? -1 : 1;
        player.setVelocityX(direction * -300);
        player.setVelocityY(-200);
      }


      update() {

        // Atualizar nuvens - versão corretamente tipada
        this.clouds.getChildren().forEach((gameObject: Phaser.GameObjects.GameObject) => {
          const cloud = gameObject as Phaser.GameObjects.Image;
          cloud.x += cloud.getData('speed');

          // Reciclar nuvens que saírem da tela
          if (cloud.x > this.scale.width + 100) {
            cloud.x = -100;
            cloud.y = Phaser.Math.Between(50, 200);
          }
        });
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
        this.hudText.setText(`Notas Coletadas: ${this.score}`);
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth, // Usa a largura da janela
      height: window.innerHeight, // Usa a altura da janela
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
      },
      scale: {
        mode: Phaser.Scale.RESIZE, // Escala o jogo para preencher a tela
        autoCenter: Phaser.Scale.CENTER_BOTH // Centraliza o jogo
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
    <>
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
    </>
  );
};

export default GameCanvas;