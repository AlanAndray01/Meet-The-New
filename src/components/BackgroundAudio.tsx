'use client';

import { useEffect, useRef } from 'react';

export default function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.3; // Set a reasonable background volume

    // Play function to handle browser autoplay policies
    const playAudio = async () => {
      if (!audio.paused) return; // Already playing
      
      try {
        await audio.play();
        // Once playing successfully, we can safely remove ALL interaction listeners
        const events = ['pointerdown', 'mousemove', 'scroll', 'click', 'keydown', 'touchstart'];
        events.forEach(evt => document.removeEventListener(evt, playAudio));
      } catch { 
        // Autoplay was prevented by the browser. 
        // We do NOT remove the listeners here so they can keep trying on the next interaction.
      }
    };

    // Try playing immediately
    playAudio();

    // Attach listeners for strict browsers
    // By NOT using { once: true }, the mousemove will keep triggering playAudio 
    // until the browser finally accepts it (which instantly removes the listeners).
    const events = ['pointerdown', 'mousemove', 'scroll', 'click', 'keydown', 'touchstart'];
    events.forEach(evt => document.addEventListener(evt, playAudio));

    return () => {
      events.forEach(evt => document.removeEventListener(evt, playAudio));
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src="/audio/ARMY - AMV -Anime Mix.mp3"
      loop
      autoPlay
      preload="auto"
      style={{ display: 'none' }}
    />
  );
}
