import { useEffect, useRef } from "react";
import Phaser from "phaser";
import io from "socket.io-client";

let socket;

export default function TanksCanvas({ room_id }) {
  const gameContainerRef = useRef(null);

  useEffect(() => {
    if (!room_id || !gameContainerRef.current) return;

    socket = io();

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
    let otherTanks = {};

    function preload() {
      this.load.image("tank", "/assets/tank_blue.png");
      this.load.image("bullet", "/assets/bullet.png");
    }

    function create() {
      cursors = this.input.keyboard.createCursorKeys();
      bullets = this.physics.add.group();

      tank = this.physics.add.sprite(400, 300, "tank").setCollideWorldBounds(true);
      tank.setDrag(100);
      tank.setAngularDrag(100);
      tank.setMaxVelocity(200);

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
        x: bullet.x,
        y: bullet.y,
        vx: bullet.body.velocity.x,
        vy: bullet.body.velocity.y,
        room_id,
      });
    }

    function update(time, delta) {
      if (!tank) return;

      if (cursors.left.isDown) tank.setAngularVelocity(-150);
      else if (cursors.right.isDown) tank.setAngularVelocity(150);
      else tank.setAngularVelocity(0);

      if (cursors.up.isDown) this.physics.velocityFromRotation(tank.rotation, 200, tank.body.acceleration);
      else tank.setAcceleration(0);

      socket.emit("tank_move", {
        x: tank.x,
        y: tank.y,
        rotation: tank.rotation,
        room_id,
      });
    }

    // Receive other tanks
    socket.on("update_tanks", (tanks) => {
      Object.keys(tanks).forEach((id) => {
        if (id === socket.id) return;

        if (!otherTanks[id]) {
          otherTanks[id] = game.scene.scenes[0].physics.add.sprite(tanks[id].x, tanks[id].y, "tank").setTint(0xff0000);
        }

        otherTanks[id].x = tanks[id].x;
        otherTanks[id].y = tanks[id].y;
        otherTanks[id].rotation = tanks[id].rotation;
      });
    });

    // Receive fired bullets from others
    socket.on("spawn_bullet", ({ x, y, vx, vy }) => {
      const b = bullets.create(x, y, "bullet");
      b.body.velocity.set(vx, vy);
    });

    return () => {
      socket.disconnect();
      game.destroy(true);
    };
  }, [room_id]);

  return <div ref={gameContainerRef} />;
}