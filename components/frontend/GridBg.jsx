import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const GridBg = () => {
  const [isDark, setIsDark] = useState(false);
  const [show, setShow] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [trails, setTrails] = useState([]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      const id = Math.random().toString(36);
      setTrails((prev) => [...prev, { x: e.clientX, y: e.clientY, id }]);

      setTimeout(() => {
        setTrails((prev) => prev.filter((t) => t.id !== id));
      }, 2000); // fade after 5s
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <>
      <StyledBg isDark={isDark} />

      {/* Paint Trail Layer */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {trails.map((trail) => (
          <div
            key={trail.id}
            className="absolute rounded-full"
            style={{
              top: trail.y - 5,
              left: trail.x - 5,
              width: 12,
              height: 12,
              backgroundColor: isDark ? '#FFB6C1' : '#ef4444',
              opacity: 0.8,
              animation: 'fadeout 5s ease-out forwards',
            }}
          />
        ))}

        {/* Brush Icon (use your own /public/paintbrush.png) */}
        <img
          src="/paintbrush.png"
          alt="brush"
          className="absolute z-0"
          style={{
            top: cursorPos.y,
            left: cursorPos.x,
            width: 46,
            height: 46,
            transform: 'translate(-50%, -50%) rotate(-25deg)',
            opacity: 0.9,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Light/Dark Mode Switch */}
      <SwitchWrapper className={show ? 'show' : ''}>
        <div
          className={`w-48 aspect-video rounded-xl border-4 ${
            isDark ? 'bg-[#3a3347]' : 'bg-[#ebe6ef]'
          } border-[#121331] origin-center`}
          style={{ transform: 'rotate(90deg) scale(0.50)' }}
        >
          <div className="flex h-full w-full px-2 items-center gap-x-2">
            <div className="w-6 h-6 flex-shrink-0 rounded-full border-4 border-[#121331]" />
            <label
              htmlFor="switch"
              className={`w-full h-10 border-4 border-[#121331] rounded cursor-pointer ${
                !isDark ? 'scale-x-[-1]' : ''
              }`}
            >
              <input
                type="checkbox"
                id="switch"
                className="hidden"
                checked={!isDark}
                onChange={toggleTheme}
              />
              <div className="w-full h-full bg-[#f24c00] relative">
                <div className="w-0 h-0 z-20 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-t-[20px] border-t-[#121331] relative">
                  <div className="w-0 h-0 absolute border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[15px] border-t-[#e44901] -top-5 -left-[18px]" />
                </div>
                <div className="w-[24px] h-9 z-10 absolute top-[9px] left-0 bg-[#f24c00] border-r-2 border-b-4 border-[#121331] transform skew-y-[39deg]" />
                <div className="w-[25px] h-9 z-10 absolute top-[9px] left-[24px] bg-[#c44002] border-r-4 border-l-2 border-b-4 border-[#121331] transform skew-y-[-39deg]" />
              </div>
            </label>
            <div className="w-6 h-1 flex-shrink-0 bg-[#121331] rounded-full" />
          </div>
        </div>
      </SwitchWrapper>
    </>
  );
};

const StyledBg = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -2;
  transition: background 0.4s ease;
  --line-color: ${({ isDark }) =>
    isDark ? 'rgba(114, 114, 114, 0.3)' : 'rgba(255, 206, 151)'};
  background-color: ${({ isDark }) => (isDark ? '#191a1a' : '#fee9d0')};
  background-image: linear-gradient(
      0deg,
      transparent 24%,
      var(--line-color) 25%,
      var(--line-color) 26%,
      transparent 27%,
      transparent 74%,
      var(--line-color) 75%,
      var(--line-color) 76%,
      transparent 77%,
      transparent
    ),
    linear-gradient(
      90deg,
      transparent 24%,
      var(--line-color) 25%,
      var(--line-color) 26%,
      transparent 27%,
      transparent 74%,
      var(--line-color) 75%,
      var(--line-color) 76%,
      transparent 77%,
      transparent
    );
  background-size: 55px 55px;
`;

const SwitchWrapper = styled.div`
  position: fixed;
  right: -1rem;
  top: 50%;
  transform: translateY(-50%) translateX(200%);
  z-index: 100;
  transition: transform 0.6s ease-out;

  &.show {
    transform: translateY(-50%) translateX(0%);
  }
`;

export default GridBg;
