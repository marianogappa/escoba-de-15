import { useEffect } from 'react';
import { audioPaths } from './audioPaths';

const AssetPreloader = () => {
  useEffect(() => {
    const preloadAssets = async () => {
      // Preload images
      const imageUrls = [
        ...Array.from({ length: 12 }, (_, i) => `${process.env.PUBLIC_URL}/img/${String(i + 1).padStart(2, '0')}-oros.png`),
        ...Array.from({ length: 12 }, (_, i) => `${process.env.PUBLIC_URL}/img/${String(i + 1).padStart(2, '0')}-copas.png`),
        ...Array.from({ length: 12 }, (_, i) => `${process.env.PUBLIC_URL}/img/${String(i + 1).padStart(2, '0')}-espadas.png`),
        ...Array.from({ length: 12 }, (_, i) => `${process.env.PUBLIC_URL}/img/${String(i + 1).padStart(2, '0')}-bastos.png`),
        `${process.env.PUBLIC_URL}/img/reverso.png`,
        `${process.env.PUBLIC_URL}/img/bot.png`,
        `${process.env.PUBLIC_URL}/img/human.png`,
      ];

      imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
      });

      // Preload audio
      const audioUrls = Object.values(audioPaths).flat().map(path => `${process.env.PUBLIC_URL}/mp3/${path}`);
      const uniqueAudioUrls = [...new Set(audioUrls)];

      uniqueAudioUrls.forEach((url) => {
        const audio = new Audio();
        audio.src = url;
        audio.preload = 'auto';
        audio.load();
      });
    };

    preloadAssets();
  }, []);

  return null; // This component doesn't render anything
};

export default AssetPreloader;
