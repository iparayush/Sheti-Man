
/**
 * Decodes base64 string to Uint8Array manually.
 */
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data (16-bit, Single Channel, 24kHz) into an AudioBuffer.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Plays audio. If input is text or a special signal, it falls back to Browser TTS.
 * Otherwise, it decodes raw PCM bytes from Gemini.
 */
export const playAudio = async (input: string): Promise<void> => {
  if (!input) return;

  // Case 1: Browser TTS Fallback
  if (input === "BROWSER_TTS_SIGNAL" || (!input.startsWith('/') && input.length > 50 && !input.includes(';base64,'))) {
    const textToSpeak = input === "BROWSER_TTS_SIGNAL" ? "Service busy. Using basic voice." : input;
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  // Case 2: Gemini PCM Audio Data
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const pcmData = decodeBase64(input);
    const audioBuffer = await decodeAudioData(pcmData, audioContext);
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    return new Promise((resolve) => {
      source.onended = () => {
        audioContext.close();
        resolve();
      };
      source.start();
    });
  } catch (err) {
    console.error("Audio playback error:", err);
    // Silent fallback
    const utterance = new SpeechSynthesisUtterance("Reading from backup.");
    window.speechSynthesis.speak(utterance);
  }
};
