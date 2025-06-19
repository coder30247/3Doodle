import { useEffect, useRef } from "react";
import Lobby_Store from "../states/Lobby_Store.js";
import Auth_Store from "../states/Auth_Store.js";
import Socket_Store from "../states/Socket_Store.js";
import Phaser from "phaser";

export default function Game_Canvas({ room_id }) {
    const gameContainerRef = useRef(null);
    const players = Lobby_Store((state) => state.players);
    const your_id = Auth_Store((state) => state.firebase_uid);
    const socket = Socket_Store((state) => state.socket);
    const sprite_map = useRef(new Map());
    const sprite_positions = useRef(new Map());

    useEffect(() => {
        if (!room_id || !gameContainerRef.current) return;

        socket.on("player:position_update", ({ firebase_uid, x, y }) => {
            sprite_positions.current.set(firebase_uid, { x, y });
        });

        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            backgroundColor: "#1e1e1e",
            parent: gameContainerRef.current,
            physics: {
                default: "arcade",
                arcade: {
                    gravity: { y: 600 },
                    debug: true,
                },
            },
            scene: {
                preload,
                create,
                update,
            },
        };

        let game = new Phaser.Game(config);

        function preload() {
            this.load.image(
                "ground",
                "https://labs.phaser.io/assets/sprites/platform.png"
            );
            this.load.image(
                "player",
                "https://labs.phaser.io/assets/sprites/phaser-dude.png"
            );
        }

        function create() {
            const platforms = this.physics.add.staticGroup();
            platforms.create(400, 580, "ground").setScale(2).refreshBody();

            let index = 0;

            players.forEach((player) => {
                const x = 200 + index * 50;
                const y = 450;

                const sprite = this.physics.add.sprite(x, y, "player");
                sprite.setBounce(0.2);
                sprite.setCollideWorldBounds(true);
                this.physics.add.collider(sprite, platforms);

                // ✅ Correct: Using sprite_map passed in from useRef
                sprite_map.current.set(player.firebase_uid, sprite);

                if (player.firebase_uid === your_id) {
                    this.player = sprite;
                    this.cursors = this.input.keyboard.createCursorKeys();
                }

                index++;
            });
        }

        function update() {
            const speed = 200;
            if (this.player) {
                this.player.setVelocityX(0);
                if (this.cursors.left.isDown) {
                    this.player.setVelocityX(-speed);
                } else if (this.cursors.right.isDown) {
                    this.player.setVelocityX(speed);
                }
                if (this.cursors.up.isDown && this.player.body.touching.down) {
                    this.player.setVelocityY(-400);
                }
                const { x, y } = this.player;
                socket.emit("player:update_position", { room_id, x, y });
            }
            sprite_positions.current.forEach((pos, firebase_uid) => {
                if (firebase_uid !== your_id) {
                    const sprite = sprite_map.current.get(firebase_uid);
                    if (sprite) {
                        sprite.setPosition(pos.x, pos.y);
                    }
                }
            });
        }

        return () => {
            game.destroy(true);
        };
    }, [room_id]);

    return <div ref={gameContainerRef} />;
}
