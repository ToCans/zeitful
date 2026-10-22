// Play Audio for Button Clicks, Timer Finishing, etc.
export const playAudio = (audio: HTMLAudioElement | null) => {
  if (audio) {
    audio.play().catch((error) => {
      console.error("Failed to play audio:", error);
    });
  }
};
