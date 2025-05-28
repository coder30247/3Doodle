import React, { useRef, useEffect } from "react";

export default function GameCanvas({ socket, roomId }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const lastDrawerIdRef = useRef(null); // To track who drew last
  const pointsBufferRef = useRef([]); // Buffer points locally before sending

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.7;
    canvas.height = window.innerHeight * 0.7;
    canvas.style.background = "white";

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctxRef.current = ctx;

    // Listen for drawing events from server
    socket.on("draw", ({ points, drawerId }) => {
      if (lastDrawerIdRef.current !== drawerId) {
        clearCanvas();
        lastDrawerIdRef.current = drawerId;
      }
      drawPoints(points);
    });

    return () => {
      socket.off("draw");
    };
  }, [socket]);

  // Clear entire canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Draw an array of points as a continuous line
  const drawPoints = (points) => {
    if (!points || points.length === 0) return;
    const ctx = ctxRef.current;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  };

  // Get mouse position relative to canvas
  const getCoords = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  // Send buffered points to server and reset buffer
  const sendBufferedPoints = () => {
    if (pointsBufferRef.current.length === 0) return;
    socket.emit("draw", {
      roomId,
      points: pointsBufferRef.current,
      drawerId: socket.id,
    });
    pointsBufferRef.current = [];
  };

  // Mouse down: start drawing
  const handleMouseDown = (event) => {
    drawingRef.current = true;
    const point = getCoords(event);
    pointsBufferRef.current.push(point);
    drawPoints([point]);
  };

  // Mouse move: continue drawing if mouse is down
  const handleMouseMove = (event) => {
    if (!drawingRef.current) return;
    const point = getCoords(event);
    pointsBufferRef.current.push(point);
    drawPoints([pointsBufferRef.current[pointsBufferRef.current.length - 2], point]);
  };

  // Mouse up: stop drawing and send buffered points
  const handleMouseUp = (event) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    sendBufferedPoints();
  };

  // Mouse leave: treat like mouse up to stop drawing
  const handleMouseLeave = () => {
    if (drawingRef.current) {
      drawingRef.current = false;
      sendBufferedPoints();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        border: "2px solid black",
        borderRadius: "8px",
        display: "block",
        margin: "20px auto",
        backgroundColor: "white",
        cursor: "crosshair",
      }}
    />
  );
}
