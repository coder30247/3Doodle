import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function GameCanvas({ socket, roomId }) {
  const mountRef = useRef(null);
  const drawing = useRef(false);
  const points = useRef([]);
  const lineRef = useRef();
  const sceneRef = useRef();

  useEffect(() => {
    if (!socket) return;

    const width = window.innerWidth * 0.75; // Adjust for chat sidebar
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    sceneRef.current = scene;

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const geometry = new THREE.BufferGeometry().setFromPoints([]);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    lineRef.current = line;

    const handlePointerDown = () => {
      drawing.current = true;
      points.current = [];
    };

    const handlePointerUp = () => {
      drawing.current = false;
      socket.emit("draw", { roomId, points: points.current });
    };

    const handlePointerMove = (event) => {
      if (!drawing.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const vector = new THREE.Vector3(x, y, 0).unproject(camera);
      points.current.push(vector);

      const geometry = new THREE.BufferGeometry().setFromPoints(points.current);
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = geometry;
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);

    socket.on("draw", ({ points }) => {
      const otherMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
      const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, p.y, p.z))
      );
      const otherLine = new THREE.Line(geometry, otherMaterial);
      scene.add(otherLine);
    });

    return () => {
      socket.off("draw");
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [roomId, socket]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}