import { useEffect, useRef } from "react";
import Phaser from "phaser";
import io from "socket.io-client";

let socket;

export default function TanksCanvas({ room_id, firebaseUid }) {
  const gameContainerRef = useRef(null);

  useEffect(() => {
    if (!room_id || !firebaseUid || !gameContainerRef.current) return;

    socket = io("http://localhost:4000");

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameContainerRef.current,
      backgroundColor: "#2d2d2d",
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
    };

    let game = new Phaser.Game(config);
    let tank, cursors, bullets, lastFired = 0;
    let otherTanks = {}; // store other players' tanks

    function preload() {
      this.load.image("tank", "/assets/tank_blue.png");
      this.load.image("tank_enemy", "/assets/tank_red.png");
      this.load.image("bullet", "/assets/bullet.png");
    }

    function create() {
      cursors = this.input.keyboard.createCursorKeys();
      bullets = this.physics.add.group();

      // Create local player's tank
      tank = this.physics.add.sprite(
        Phaser.Math.Between(100, 700),
        Phaser.Math.Between(100, 500),
        "tank"
      ).setCollideWorldBounds(true);

      tank.setDrag(100);
      tank.setAngularDrag(100);
      tank.setMaxVelocity(200);

      // Identify self to server
      socket.emit("auth", {
        firebaseUid,
        username: `Player_${firebaseUid.slice(0, 5)}`,
      });

      // Join the lobby
      socket.emit("join_lobby", { lobby_id: room_id });

      // Mouse shooting
      this.input.on("pointerdown", () => fireBullet(this));
    }

    function fireBullet(scene) {
      const now = scene.time.now;
      if (now - lastFired < 300) return;
      lastFired = now;

      const bullet = bullets.create(tank.x, tank.y, "bullet");
      scene.physics.velocityFromRotation(tank.rotation, 400, bullet.body.velocity);
      bullet.rotation = tank.rotation;

      socket.emit("fire_bullet", {
        lobby_id: room_id,
        bulletData: {
          x: bullet.x,
          y: bullet.y,
          vx: bullet.body.velocity.x,
          vy: bullet.body.velocity.y,
        },
      });
    }

    function update() {
      if (!tank) return;

      if (cursors.left.isDown) tank.setAngularVelocity(-150);
      else if (cursors.right.isDown) tank.setAngularVelocity(150);
      else tank.setAngularVelocity(0);

      if (cursors.up.isDown)
        this.physics.velocityFromRotation(tank.rotation, 200, tank.body.acceleration);
      else tank.setAcceleration(0);

      socket.emit("tank_move", {
        x: tank.x,
        y: tank.y,
        rotation: tank.rotation,
        room_id,
        firebaseUid,
      });
    }

    socket.on("update_tanks", (tankStates) => {
      Object.entries(tankStates).forEach(([uid, state]) => {
        if (uid === firebaseUid) return; // skip self

        if (!otherTanks[uid]) {
          // Add new enemy tank
          otherTanks[uid] = game.scene.scenes[0].physics.add.sprite(
            state.x,
            state.y,
            "tank_enemy"
          ).setCollideWorldBounds(true);
        }

        const enemyTank = otherTanks[uid];
        enemyTank.x = state.x;
        enemyTank.y = state.y;
        enemyTank.rotation = state.rotation;
      });

      // Clean up tanks of disconnected players
      Object.keys(otherTanks).forEach((uid) => {
        if (!tankStates[uid]) {
          otherTanks[uid].destroy();
          delete otherTanks[uid];
        }
      });
    });

    socket.on("bullet_fired", ({ bulletData }) => {
      const b = bullets.create(bulletData.x, bulletData.y, "bullet");
      b.body.velocity.set(bulletData.vx, bulletData.vy);
    });

    return () => {
      socket.disconnect();
      game.destroy(true);
    };
  }, [room_id, firebaseUid]);

  return <div ref={gameContainerRef} />;
}
