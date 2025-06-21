import { useEffect, useRef } from "react";
import Phaser from "phaser";
import io from "socket.io-client";

let socket;

export default function TanksCanvas({ room_id, firebaseUid }) {
  const gameContainerRef = useRef(null);

  useEffect(() => {
    if (!room_id || !firebaseUid || !gameContainerRef.current) return;

    console.log("🎮 Starting game for:", { room_id, firebaseUid });

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
    let scene; // Store scene reference
    let isAuthenticated = false;
    let hasJoinedLobby = false;

    function preload() {
      console.log("🔄 Preloading assets...");
      this.load.image("tank", "/assets/tank_blue.png");
      this.load.image("tank_red", "/assets/tank_red.png");
      this.load.image("bullet", "/assets/bullet.png");
    }

    function create() {
      console.log("🏗️ Creating game scene...");
      scene = this;
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

      console.log("🚗 Created local tank at:", { x: tank.x, y: tank.y, rotation: tank.rotation });

      // Mouse shooting
      this.input.on("pointerdown", () => fireBullet(this));

      // Start authentication process immediately
      setTimeout(() => authenticateAndJoin(), 100);
    }

    function authenticateAndJoin() {
      console.log("🔐 Starting authentication...");
      
      // First authenticate
      socket.emit("auth", {
        firebaseUid,
        username: `Player_${firebaseUid.slice(0, 5)}`,
      });
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

      let moved = false;

      if (cursors.left.isDown) {
        tank.setAngularVelocity(-150);
        moved = true;
      } else if (cursors.right.isDown) {
        tank.setAngularVelocity(150);
        moved = true;
      } else {
        tank.setAngularVelocity(0);
      }

      if (cursors.up.isDown) {
        this.physics.velocityFromRotation(tank.rotation, 200, tank.body.acceleration);
        moved = true;
      } else {
        tank.setAcceleration(0);
      }

      // Send position updates regardless of authentication status for now
      if (socket && socket.connected) {
        socket.emit("tank_move", {
          x: Math.round(tank.x),
          y: Math.round(tank.y),
          rotation: Math.round(tank.rotation * 100) / 100,
          room_id,
          firebaseUid,
        });
      }
    }

    // Socket event handlers
    socket.on("connect", () => {
      console.log("🔌 Connected to server with socket ID:", socket.id);
      // Auto-authenticate and join
      setTimeout(() => {
        if (tank) {
          console.log("🔐 Auto-authenticating and joining...");
          socket.emit("auth", {
            firebaseUid,
            username: `Player_${firebaseUid.slice(0, 5)}`,
          });
          
          // Join lobby immediately after auth
          setTimeout(() => {
            socket.emit("join_lobby", { 
              lobby_id: room_id,
              initialPosition: {
                x: tank.x,
                y: tank.y,
                rotation: tank.rotation
              }
            });
          }, 100);
        }
      }, 500);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      isAuthenticated = false;
      hasJoinedLobby = false;
    });

    // Handle authentication success - simplified approach
    socket.on("auth_success", () => {
      console.log("✅ Authentication successful");
      isAuthenticated = true;
      
      // Immediately join the lobby after auth
      console.log("🚪 Joining lobby:", room_id);
      socket.emit("join_lobby", { 
        lobby_id: room_id,
        initialPosition: {
          x: tank.x,
          y: tank.y,
          rotation: tank.rotation
        }
      });
    });

    // Simplified - don't wait for auth success, just join
    socket.on("connect", () => {
      console.log("🔌 Connected to server with socket ID:", socket.id);
      // Auto-authenticate and join
      setTimeout(() => {
        if (tank) {
          console.log("🔐 Auto-authenticating and joining...");
          socket.emit("auth", {
            firebaseUid,
            username: `Player_${firebaseUid.slice(0, 5)}`,
          });
          
          // Join lobby immediately after auth
          setTimeout(() => {
            socket.emit("join_lobby", { 
              lobby_id: room_id,
              initialPosition: {
                x: tank.x,
                y: tank.y,
                rotation: tank.rotation
              }
            });
          }, 100);
        }
      }, 500);
    });

    socket.on("joined_lobby", (data) => {
      console.log("🎊 Successfully joined lobby:", data);
      hasJoinedLobby = true;
    });

    socket.on("update_tanks", (tankStates) => {
      if (!scene) return;

      console.log("📡 Received tank states:", tankStates);
      console.log("🔍 Current other tanks:", Object.keys(otherTanks));

      Object.entries(tankStates).forEach(([uid, state]) => {
        if (uid === firebaseUid) return; // skip self

        if (!otherTanks[uid]) {
          // Add new enemy tank
          console.log("➕ Adding new enemy tank for player:", uid, "at position:", state);
          otherTanks[uid] = scene.physics.add.sprite(
            state.x,
            state.y,
            "tank_red"
          ).setCollideWorldBounds(true);
          
          // Make sure the tank is visible
          otherTanks[uid].setVisible(true);
          otherTanks[uid].setActive(true);
          
        } else {
          // Update existing enemy tank position
          const enemyTank = otherTanks[uid];
          enemyTank.x = state.x;
          enemyTank.y = state.y;
          enemyTank.rotation = state.rotation;
        }
      });

      // Clean up tanks of disconnected players
      Object.keys(otherTanks).forEach((uid) => {
        if (!tankStates[uid]) {
          console.log("🗑️ Removing tank for disconnected player:", uid);
          if (otherTanks[uid]) {
            otherTanks[uid].destroy();
            delete otherTanks[uid];
          }
        }
      });

      console.log("🎯 Final other tanks count:", Object.keys(otherTanks).length);
    });

    socket.on("bullet_fired", ({ firebaseUid: shooterUid, bulletData }) => {
      // Skip own bullets
      if (shooterUid === firebaseUid) return;
      
      if (!scene) return;
      console.log("💥 Enemy bullet fired by:", shooterUid);
      const b = bullets.create(bulletData.x, bulletData.y, "bullet");
      b.body.velocity.set(bulletData.vx, bulletData.vy);
    });

    socket.on("current_game_state", (gameState) => {
      console.log("🎮 Received current game state:", gameState);
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    // Handle authentication being required
    socket.on("auth_required", () => {
      console.log("🔐 Authentication required, retrying...");
      authenticateAndJoin();
    });

    return () => {
      console.log("🧹 Cleaning up game...");
      if (socket) {
        socket.disconnect();
      }
      if (game) {
        game.destroy(true);
      }
    };
  }, [room_id, firebaseUid]);

  return <div ref={gameContainerRef} />;
}