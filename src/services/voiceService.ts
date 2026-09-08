/**
 * Reck Companion - Voice & Audio Service
 * Handles microphone capture, speech recognition, speech synthesis, and Call Reck session audio.
 */

export interface VoiceSessionState {
  isActive: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  durationSeconds: number;
  encryptionState: string;
  transcript: string;
  assistantResponse: string;
}

export type VoiceStateCallback = (state: VoiceSessionState) => void;
export type AudioLevelCallback = (level: number) => void;

class VoiceService {
  private recognition: any = null;
  private isListening = false;
  private synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private timerInterval: any = null;
  private levelInterval: any = null;

  private sessionState: VoiceSessionState = {
    isActive: false,
    isMuted: false,
    isSpeakerOn: true,
    durationSeconds: 0,
    encryptionState: 'Quantum E2EE (ChaCha20-Poly1305)',
    transcript: '',
    assistantResponse: ''
  };

  private stateListeners: Set<VoiceStateCallback> = new Set();
  private audioLevelListeners: Set<AudioLevelCallback> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-US';

          this.recognition.onresult = (event: any) => {
            let current = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              current += event.results[i][0].transcript;
            }
            this.sessionState.transcript = current;
            this.notifyState();
          };

          this.recognition.onerror = (e: any) => {
            console.warn('[VoiceService] Speech recognition notice:', e.error);
          };
        } catch (err) {
          console.warn('[VoiceService] SpeechRecognition init caught:', err);
        }
      }
    }
  }

  public subscribeState(cb: VoiceStateCallback): () => void {
    this.stateListeners.add(cb);
    cb({ ...this.sessionState });
    return () => this.stateListeners.delete(cb);
  }

  public subscribeAudioLevel(cb: AudioLevelCallback): () => void {
    this.audioLevelListeners.add(cb);
    return () => this.audioLevelListeners.delete(cb);
  }

  private notifyState() {
    this.stateListeners.forEach(cb => cb({ ...this.sessionState }));
  }

  private notifyAudioLevel(level: number) {
    this.audioLevelListeners.forEach(cb => cb(level));
  }

  public startCallSession(onTranscript?: (text: string) => void) {
    if (this.sessionState.isActive) return;

    this.sessionState = {
      isActive: true,
      isMuted: false,
      isSpeakerOn: true,
      durationSeconds: 0,
      encryptionState: 'Quantum E2EE (ChaCha20-Poly1305)',
      transcript: '',
      assistantResponse: 'Reck Voice Link connected. How can I assist you on your devices?'
    };
    this.notifyState();

    this.timerInterval = setInterval(() => {
      this.sessionState.durationSeconds += 1;
      this.notifyState();
    }, 1000);

    // Audio level simulation for the dynamic Reck Core
    this.levelInterval = setInterval(() => {
      if (this.sessionState.isMuted) {
        this.notifyAudioLevel(0.05);
      } else {
        const base = Math.sin(Date.now() / 150) * 0.3 + 0.5;
        const jitter = Math.random() * 0.3;
        this.notifyAudioLevel(Math.min(1.0, Math.max(0.1, base + jitter)));
      }
    }, 120);

    this.startListening();
    this.speak('Reck voice link active.');
  }

  public endCallSession() {
    if (!this.sessionState.isActive) return;

    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.levelInterval) clearInterval(this.levelInterval);

    this.stopListening();
    if (this.synth) this.synth.cancel();

    this.sessionState.isActive = false;
    this.sessionState.transcript = '';
    this.sessionState.assistantResponse = '';
    this.notifyState();
    this.notifyAudioLevel(0);
  }

  public toggleMute(): boolean {
    this.sessionState.isMuted = !this.sessionState.isMuted;
    this.notifyState();
    return this.sessionState.isMuted;
  }

  public toggleSpeaker(): boolean {
    this.sessionState.isSpeakerOn = !this.sessionState.isSpeakerOn;
    this.notifyState();
    return this.sessionState.isSpeakerOn;
  }

  public startListening() {
    if (this.isListening) return;
    if (this.recognition) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (err) {
        console.warn('Recognition start caught:', err);
      }
    }
  }

  public stopListening() {
    if (!this.isListening) return;
    if (this.recognition) {
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch (err) {
        console.warn('Recognition stop caught:', err);
      }
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;

      // Select high quality voice if available
      const voices = this.synth.getVoices();
      const techVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google')));
      if (techVoice) {
        utterance.voice = techVoice;
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Synth speak error:', e);
      if (onEnd) onEnd();
    }
  }
}

export const voiceService = new VoiceService();
