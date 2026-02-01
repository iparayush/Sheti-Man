
/**
 * Uses the browser's native Web Speech API to read text aloud.
 * This ensures zero dependency on external AI audio APIs and zero quota usage.
 */
export const playAudio = async (input: string): Promise<void> => {
  if (!input) return;

  // If the input is the signal from geminiService, we shouldn't attempt to play it directly
  // but instead this utility should be called with the actual text to speak.
  if (input === "BROWSER_TTS_SIGNAL") return;

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(input);
    
    // Attempt to select a local language voice if possible
    const voices = window.speechSynthesis.getVoices();
    // Simple logic to find a voice that matches the text's potential script
    // Note: Real-world language detection is complex, we just pick the first available for now.
    
    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
};
