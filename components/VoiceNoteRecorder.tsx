'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mic,
  Square,
  Play,
  Pause,
  Send,
  Trash2,
  Volume2,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface VoiceNoteRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (audioBlob: Blob, duration: number) => void;
  recipientName?: string;
  maxDuration?: number; // in seconds
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'recorded' | 'playing';

// ─────────────────────────────────────────────────────────────────────────────
// Waveform Component
// ─────────────────────────────────────────────────────────────────────────────
function WaveformVisualizer({
  isRecording,
  audioLevel,
}: {
  isRecording: boolean;
  audioLevel: number;
}) {
  const bars = 24;

  return (
    <div className="flex items-center justify-center space-x-1.5 h-20">
      {Array.from({ length: bars }).map((_, index) => {
        const delay = index * 0.05;
        const barHeight = isRecording
          ? Math.max(8, Math.random() * audioLevel * 60 + 8)
          : 8;

        return (
          <motion.div
            key={index}
            className="w-1.5 rounded-full bg-gradient-to-t from-saffron-500 via-saffron-400 to-rose-400"
            animate={{
              height: isRecording ? [8, barHeight, 8] : 8,
              opacity: isRecording ? [0.6, 1, 0.6] : 0.4,
            }}
            transition={{
              duration: 0.4,
              repeat: isRecording ? Infinity : 0,
              delay,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Timer Component
// ─────────────────────────────────────────────────────────────────────────────
function TimerDisplay({ seconds, maxSeconds }: { seconds: number; maxSeconds: number }) {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progress = (seconds / maxSeconds) * 100;
  const isNearLimit = seconds >= maxSeconds - 3;

  return (
    <div className="text-center">
      <motion.div
        className={cn(
          'text-4xl font-mono font-bold',
          isNearLimit ? 'text-rose-400' : 'text-white'
        )}
        animate={isNearLimit ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3, repeat: isNearLimit ? Infinity : 0 }}
      >
        {formatTime(seconds)}
      </motion.div>
      <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden max-w-[200px] mx-auto">
        <motion.div
          className={cn(
            'h-full rounded-full',
            isNearLimit
              ? 'bg-gradient-to-r from-rose-500 to-rose-400'
              : 'bg-gradient-to-r from-saffron-500 to-rose-500'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
      <p className={cn('text-xs mt-2', isNearLimit ? 'text-rose-400' : 'text-midnight-400')}>
        {isNearLimit ? 'Almost at limit!' : 'Keep it under 15 seconds'}
      </p>
      <p className="text-xs text-midnight-500 hindi-text mt-0.5">
        15 सेकंड से कम रखें
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function VoiceNoteRecorder({
  isOpen,
  onClose,
  onSend,
  recipientName,
  maxDuration = 15,
}: VoiceNoteRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0.5);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      cleanup();
      setState('idle');
      setRecordingTime(0);
      setAudioBlob(null);
      setAudioUrl(null);
      setError(null);
    }
  }, [isOpen]);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    setError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup audio context for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 64;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setState('recorded');
        cleanup();
      };

      mediaRecorder.start();
      setState('recording');

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);

      // Update audio level visualization
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAudioLevel(average / 255);
        }
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone access denied. Please enable permissions.');
      setState('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      setState('playing');
      const audio = new Audio(audioUrl);
      audio.onended = () => setState('recorded');
      audio.play();
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, recordingTime);
      onClose();
    }
  };

  const handleCancel = () => {
    cleanup();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setState('idle');
  };

  const getInstructionText = () => {
    switch (state) {
      case 'idle':
        return {
          en: 'Tap to record voice note',
          hi: 'वॉइस नोट रिकॉर्ड करने के लिए टैप करें',
        };
      case 'recording':
      case 'paused':
        return {
          en: 'Speaking...',
          hi: 'बोल रहे हैं...',
        };
      case 'recorded':
        return {
          en: 'Preview your voice note',
          hi: 'अपना वॉइस नोट सुनें',
        };
      case 'playing':
        return {
          en: 'Playing...',
          hi: 'चल रहा है...',
        };
      default:
        return { en: '', hi: '' };
    }
  };

  const instruction = getInstructionText();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md">
              {/* Card */}
              <div className="glass-md rounded-3xl p-6 border border-white/10 relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-saffron-500/5 via-violet-500/5 to-rose-500/5 pointer-events-none" />

                {/* Header */}
                <div className="relative flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Voice Note
                    </h3>
                    {recipientName && (
                      <p className="text-sm text-midnight-400">
                        To: {recipientName}
                      </p>
                    )}
                    <p className="text-xs text-midnight-500 hindi-text mt-0.5">
                      अपना परिचय दें
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl glass-sm hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-midnight-300" />
                  </button>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2"
                    >
                      <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      <p className="text-sm text-rose-300">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Waveform Visualization */}
                <div className="relative mb-6">
                  <WaveformVisualizer
                    isRecording={state === 'recording'}
                    audioLevel={audioLevel}
                  />
                </div>

                {/* Timer */}
                {(state === 'recording' || state === 'paused' || state === 'recorded') && (
                  <div className="mb-6">
                    <TimerDisplay seconds={recordingTime} maxSeconds={maxDuration} />
                  </div>
                )}

                {/* Instruction Text */}
                <p className="text-center text-sm text-midnight-300 mb-6">
                  {state === 'idle' ? instruction.en : instruction.en}
                </p>

                {/* Control Buttons */}
                <div className="flex items-center justify-center space-x-4">
                  {/* Cancel Button */}
                  {(state === 'recorded' || state === 'recording' || state === 'paused') && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCancel}
                      className="p-4 rounded-full glass-sm border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-midnight-400" />
                    </motion.button>
                  )}

                  {/* Record/Stop Button */}
                  {state === 'idle' || state === 'recorded' ? (
                    <motion.button
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={state === 'recorded' ? handleSend : startRecording}
                      className={cn(
                        'w-20 h-20 rounded-full flex items-center justify-center',
                        'transition-all duration-300',
                        state === 'recorded'
                          ? 'bg-gradient-to-r from-saffron-500 to-rose-500 hover:shadow-saffron-glow'
                          : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-rose-glow'
                      )}
                    >
                      {state === 'recorded' ? (
                        <Send className="w-8 h-8 text-white" />
                      ) : (
                        <Mic className="w-8 h-8 text-white" />
                      )}
                    </motion.button>
                  ) : state === 'recording' ? (
                    <motion.button
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={pauseRecording}
                      className="w-20 h-20 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 flex items-center justify-center hover:shadow-rose-glow transition-shadow"
                    >
                      <Square className="w-8 h-8 text-white" />
                    </motion.button>
                  ) : (
                    <motion.button
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resumeRecording}
                      className="w-20 h-20 rounded-full bg-gradient-to-r from-saffron-500 to-violet-500 flex items-center justify-center hover:shadow-saffron-glow transition-shadow"
                    >
                      <Play className="w-8 h-8 text-white ml-1" />
                    </motion.button>
                  )}

                  {/* Play/Pause Preview Button */}
                  {state === 'recorded' && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={playRecording}
                      className="p-4 rounded-full glass-sm border border-violet-500/30 hover:bg-violet-500/20 transition-colors"
                    >
                      <Play className="w-5 h-5 text-violet-400" />
                    </motion.button>
                  )}

                  {/* Pause/Resume during recording */}
                  {state === 'recording' && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={pauseRecording}
                      className="p-4 rounded-full glass-sm border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <Pause className="w-5 h-5 text-midnight-300" />
                    </motion.button>
                  )}
                </div>

                {/* Recording Indicator Ring */}
                {state === 'recording' && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-rose-500/50"
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </div>

              {/* Tips Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 glass-sm rounded-2xl p-4 border border-white/10"
              >
                <div className="flex items-start space-x-3">
                  <Volume2 className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-midnight-300">
                      <span className="font-medium text-midnight-200">Tips: </span>
                      Speak clearly in a quiet environment. Mention your name, interests, and what you're looking for.
                    </p>
                    <p className="text-xs text-midnight-500 hindi-text mt-1">
                      शांत जगह पर स्पष्ट रूप से बोलें। अपना नाम, रुचियां और क्या ढूंढ रहे हैं बताएं।
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default VoiceNoteRecorder;
