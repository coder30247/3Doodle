// pages/game/[room_id].js
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Socket_Store from "../../states/Socket_Store";
import Phaser from "phaser";

export default function Game_Page() {
    const router = useRouter();
    const { room_id } = router.query;
    const { socket } = Socket_Store.getState();
    const gameContainerRef = useRef(null);

    useEffect(() => {
        if (!room_id || !socket || !gameContainerRef.current) return;

        // Optional: inform server we're in game view
        socket.emit("join_game_room", { room_id });

        // Phaser game config
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

        const game = new Phaser.Game(config);

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

            const player = this.physics.add
                .sprite(100, 450, "player")
                .setScale(0.5);
            player.setBounce(0.1);
            player.setCollideWorldBounds(true);
            this.physics.add.collider(player, platforms);

            this.cursors = this.input.keyboard.createCursorKeys();
            this.player = player;
        }

        function update() {
            const speed = 200;
            const { cursors, player } = this;

            player.setVelocityX(0);

            if (cursors.left.isDown) {
                player.setVelocityX(-speed);
            } else if (cursors.right.isDown) {
                player.setVelocityX(speed);
            }

            if (cursors.up.isDown && player.body.touching.down) {
                player.setVelocityY(-400);
            }
        }

        return () => {
            game.destroy(true);
        };
    }, [room_id, socket]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div ref={gameContainerRef} />
        </div>
    );
}
