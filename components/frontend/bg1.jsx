import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const BlobBg = () => {
  const [blobs, setBlobs] = useState([
    { id: 1, x: '10%', y: '20%', size: 150, delay: 0 },
    { id: 2, x: '80%', y: '40%', size: 200, delay: 0.5 },
    { id: 3, x: '70%', y: '80%', size: 180, delay: 1 },
  ]);

  return (
    <BlobContainer>
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -20, 0],
            x: [0, 10, 0]
          }}
          transition={{
            duration: 4,
            delay: blob.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            left: blob.x,
            top: blob.y,
            zIndex: -1
          }}
        >
          <BlobImage
            src={`./blob${blob.id}.svg`}
            alt={`Blob ${blob.id}`}
            style={{ width: blob.size, height: 'auto' }}
          />
        </motion.div>
      ))}
    </BlobContainer>
  );
};

const BlobContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
`;

const BlobImage = styled.img`
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.1));
`;

export default BlobBg;
