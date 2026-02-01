
/**
 * Plays text aloud using the browser's native Web Speech API.
 * This replaces the PCM decoding logic since OpenRouter provides text.
 */
export const playAudio = async (text: string): Promise<void> => {
    if (!text) return;

    return new Promise((resolve) => {
        if (!window.speechSynthesis) {
            console.error("Speech Synthesis not supported in this browser.");
            return resolve();
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text.substring(0, 1000));
        
        // Detect language for voice selection
        if (text.match(/[\u0900-\u097F]/)) {
            utterance.lang = 'hi-IN';
        } else if (text.match(/[\u0900-\u097F]/)) {
            utterance.lang = 'mr-IN';
        } else {
            utterance.lang = 'en-US';
        }

        utterance.onend = () => resolve();
        utterance.onerror = (err) => {
            console.error("Speech Synthesis Error:", err);
            resolve();
        };

        window.speechSynthesis.speak(utterance);
    });
};
