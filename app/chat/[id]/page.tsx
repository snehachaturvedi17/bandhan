'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Mic,
  Send,
  Paperclip,
  Image,
  Play,
  Pause,
  Shield,
  ShieldCheck,
  AlertTriangle,
  X,
  Check,
  CheckCheck,
  Eye,
  EyeOff,
  Heart,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  type: 'text' | 'photo' | 'voice';
  content: string;
  isFromMe: boolean;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  duration?: number; // for voice notes (seconds)
  isBlurred?: boolean; // for photos (consent-based)
}

interface ChatProfile {
  id: string;
  name: string;
  avatarUrl: string;
  verificationLevel: 'bronze' | 'silver' | 'gold';
  isOnline: boolean;
  lastActive: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────
const mockProfile: ChatProfile = {
  id: 'p1',
  name: 'Priya Sharma',
  avatarUrl: '/avatars/priya.jpg',
  verificationLevel: 'gold',
  isOnline: true,
  lastActive: 'Online',
};

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'text',
    content: 'Hi! Thanks for connecting. I saw you like traveling too!',
    isFromMe: false,
    timestamp: '10:30 AM',
    status: 'read',
  },
  {
    id: '2',
    type: 'text',
    content: 'Yes! I just came back from a trip to Rajasthan. The culture there is amazing.',
    isFromMe: true,
    timestamp: '10:32 AM',
    status: 'read',
  },
  {
    id: '3',
    type: 'text',
    content: 'Oh wow! I\'ve always wanted to visit Jaipur. How was your experience?',
    isFromMe: false,
    timestamp: '10:35 AM',
    status: 'read',
  },
  {
    id: '4',
    type: 'photo',
    content: '/photos/jaipur.jpg',
    isFromMe: true,
    timestamp: '10:36 AM',
    status: 'read',
    isBlurred: true,
  },
  {
    id: '5',
    type: 'voice',
    content: 'voice_note_1.webm',
    isFromMe: false,
    timestamp: '10:38 AM',
    status: 'read',
    duration: 12,
  },
  {
    id: '6',
    type: 'text',
    content: 'That voice note was so sweet! Your voice is very calming.',
    isFromMe: true,
    timestamp: '10:40 AM',
    status: 'delivered',
  },
  {
    id: '7',
    type: 'text',
    content: 'Thank you! 🙏 Would you like to share more about yourself?',
    isFromMe: false,
    timestamp: '10:42 AM',
    status: 'read',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────
function VerificationBadge({ level }: { level: 'bronze' | 'silver' | 'gold' }) {
  const config = {
    bronze: {
      color: 'text-amber-700 bg-amber-500/20 border-amber-500/30',
      icon: Shield,
      label: 'Verified',
    },
    silver: {
      color: 'text-midnight-200 bg-white/20 border-white/30',
      icon: Shield,
      label: 'Verified',
    },
    gold: {
      color: 'text-gold-500 bg-gold-500/20 border-gold-500/30',
      icon: ShieldCheck,
      label: 'Verified',
    },
  };

  const Icon = config[level].icon;

  return (
    <div className={cn('px-2 py-0.5 rounded-full border flex items-center space-x-1', config[level].color)}>
      <Icon className="w-3 h-3" />
      <span className="text-[10px] font-semibold">{config[level].label}</span>
    </div>
  );
}

function MessageStatus({ status }: { status?: 'sent' | 'delivered' | 'read' }) {
  if (!status) return null;

  const config = {
    sent: { icon: Check, color: 'text-midnight-400' },
    delivered: { icon: CheckCheck, color: 'text-midnight-400' },
    read: { icon: CheckCheck, color: 'text-violet-400' },
  };

  const Icon = config[status].icon;

  return <Icon className={cn('w-3.5 h-3.5', config[status].color)} />;
}

function WaveformVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const bars = 20;

  return (
    <div className="flex items-center space-x-0.5 h-8">
      {Array.from({ length: bars }).map((_, index) => {
        const delay = index * 0.05;
        return (
          <motion.div
            key={index}
            className="w-1 rounded-full bg-white/60"
            animate={{
              height: isPlaying ? [4, Math.random() * 24 + 8, 4] : 4,
            }}
            transition={{
              duration: 0.4,
              repeat: isPlaying ? Infinity : 0,
              delay,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

function VoiceNoteMessage({
  message,
  isFromMe,
}: {
  message: Message;
  isFromMe: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-3 min-w-[200px]">
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          isFromMe
            ? 'bg-white/20 hover:bg-white/30'
            : 'bg-saffron-500/80 hover:bg-saffron-500'
        )}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" />
        )}
      </button>
      <div className="flex-1">
        <WaveformVisualizer isPlaying={isPlaying} />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-white/70">
            {formatDuration(message.duration || 0)}
          </span>
          <span className="text-xs text-white/50">Voice note</span>
        </div>
      </div>
    </div>
  );
}

function PhotoMessage({
  message,
  isFromMe,
}: {
  message: Message;
  isFromMe: boolean;
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  const handleReveal = () => {
    if (message.isBlurred && !isRevealed) {
      setShowConsent(true);
    } else {
      setIsRevealed(!isRevealed);
    }
  };

  const confirmReveal = () => {
    setIsRevealed(true);
    setShowConsent(false);
  };

  return (
    <>
      <div
        onClick={handleReveal}
        className={cn(
          'relative rounded-xl overflow-hidden cursor-pointer',
          'w-48 h-48',
          message.isBlurred && !isRevealed ? 'blur-xl' : ''
        )}
      >
        <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-saffron-500/20 flex items-center justify-center">
          <Image className="w-8 h-8 text-midnight-400" />
        </div>

        {message.isBlurred && !isRevealed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
            <EyeOff className="w-6 h-6 text-white mb-2" />
            <p className="text-xs text-white text-center px-2">
              Tap to reveal photo
            </p>
          </div>
        )}

        {isRevealed && (
          <div className="absolute top-2 right-2">
            <Eye className="w-4 h-4 text-white/70" />
          </div>
        )}
      </div>

      {/* Consent Modal */}
      <AnimatePresence>
        {showConsent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConsent(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-md rounded-2xl p-6 max-w-sm w-full border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                  <h3 className="text-lg font-semibold text-white">Photo Consent</h3>
                </div>
                <p className="text-sm text-midnight-300 mb-6">
                  This photo will be revealed. By viewing, you agree to respect privacy and not share without consent.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConsent(false)}
                    className="flex-1 py-3 rounded-xl glass-sm border border-white/10 text-midnight-200 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReveal}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-rose-500 text-white font-semibold hover:shadow-saffron-glow transition-shadow"
                  >
                    View Photo
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isFromMe = message.isFromMe;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex mb-3',
        isFromMe ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[75%] px-4 py-2.5 rounded-2xl backdrop-blur-sm',
          'border',
          isFromMe
            ? 'bg-gradient-to-r from-saffron-500/80 to-rose-500/80 border-saffron-500/30 rounded-br-sm'
            : 'bg-white/10 border-white/10 rounded-bl-sm'
        )}
      >
        {message.type === 'text' && (
          <p className="text-sm text-white leading-relaxed">{message.content}</p>
        )}

        {message.type === 'photo' && (
          <PhotoMessage message={message} isFromMe={isFromMe} />
        )}

        {message.type === 'voice' && (
          <VoiceNoteMessage message={message} isFromMe={isFromMe} />
        )}

        {/* Timestamp & Status */}
        <div className={cn('flex items-center justify-end space-x-1 mt-1', isFromMe ? 'text-white/60' : 'text-white/40')}>
          <span className="text-[10px]">{message.timestamp}</span>
          {isFromMe && <MessageStatus status={message.status} />}
        </div>
      </div>
    </motion.div>
  );
}

function SafetyBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-4 mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3"
    >
      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-xs text-amber-200">
          <span className="font-semibold">Safety Tip: </span>
          Never share personal information like phone numbers or addresses until you trust the person.
        </p>
        <button
          onClick={() => setIsDismissed(true)}
          className="mt-1 text-xs text-amber-400 hover:text-amber-300"
        >
          Got it
        </button>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        className="p-1 hover:bg-white/10 rounded"
      >
        <X className="w-4 h-4 text-amber-400" />
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const [showSafetyTip, setShowSafetyTip] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: inputText,
      isFromMe: true,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // Simulate delivery status update
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'delivered' } : m))
      );
    }, 1000);

    // Simulate read status
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'read' } : m))
      );
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachment = (type: 'photo' | 'voice') => {
    setShowAttachment(false);

    if (type === 'photo') {
      // Simulate photo upload
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'photo',
        content: '/photos/uploaded.jpg',
        isFromMe: true,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        status: 'sent',
        isBlurred: true,
      };
      setMessages((prev) => [...prev, newMessage]);
    } else if (type === 'voice') {
      setIsRecording(true);
      // Simulate voice note recording
      setTimeout(() => {
        setIsRecording(false);
        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'voice',
          content: 'voice_note_new.webm',
          isFromMe: true,
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }),
          status: 'sent',
          duration: 8,
        };
        setMessages((prev) => [...prev, newMessage]);
      }, 2000);
    }
  };

  const handleShareMyDate = () => {
    // Open safety date sharing modal
    console.log('Share My Date clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col safe-top safe-bottom">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-saffron-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-20 glass-md border-b border-white/10 safe-top"
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-midnight-200" />
          </button>

          {/* Profile Info */}
          <div className="flex items-center space-x-3 flex-1 ml-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-saffron-500/20 border border-white/10 flex items-center justify-center">
                <span className="text-sm font-bold text-violet-400">
                  {mockProfile.name.charAt(0)}
                </span>
              </div>
              {mockProfile.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-midnight-900" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="font-semibold text-white truncate">
                  {mockProfile.name}
                </h2>
                <VerificationBadge level={mockProfile.verificationLevel} />
              </div>
              <p className={cn('text-xs', mockProfile.isOnline ? 'text-emerald-400' : 'text-midnight-500')}>
                {mockProfile.lastActive}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <button className="p-2.5 rounded-xl hover:bg-white/10 transition-colors">
              <Phone className="w-5 h-5 text-midnight-300" />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-white/10 transition-colors">
              <Video className="w-5 h-5 text-midnight-300" />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-white/10 transition-colors">
              <MoreVertical className="w-5 h-5 text-midnight-300" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Safety Banner */}
      <AnimatePresence>
        {showSafetyTip && <SafetyBanner />}
      </AnimatePresence>

      {/* Messages Container */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {/* Match Date Banner */}
        <div className="flex items-center justify-center my-4">
          <div className="px-4 py-2 rounded-full glass-sm border border-white/10 flex items-center space-x-2">
            <Heart className="w-3.5 h-3.5 text-saffron-400" />
            <span className="text-xs text-midnight-300">
              You matched with {mockProfile.name} 3 days ago
            </span>
          </div>
        </div>

        {/* Messages */}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Typing Indicator (if needed) */}
        {/* <TypingIndicator /> */}

        <div ref={messagesEndRef} />
      </main>

      {/* Recording Overlay */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/80 backdrop-blur-md flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 flex items-center justify-center mb-4"
              >
                <Mic className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-white font-medium">Recording voice note...</p>
              <p className="text-midnight-400 text-sm mt-1">Tap to stop</p>
              <button
                onClick={() => setIsRecording(false)}
                className="mt-6 px-6 py-2 rounded-full glass-sm border border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <motion.footer
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="sticky bottom-0 z-20 glass-md border-t border-white/10 safe-bottom"
      >
        <div className="px-4 py-3">
          {/* Attachment Menu */}
          <AnimatePresence>
            {showAttachment && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                className="overflow-hidden mb-3"
              >
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAttachment('photo')}
                    className="flex-1 py-3 rounded-xl glass-sm border border-white/10 flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors"
                  >
                    <Image className="w-5 h-5 text-violet-400" />
                    <span className="text-sm text-midnight-200">Photo</span>
                  </button>
                  <button
                    onClick={() => handleAttachment('voice')}
                    className="flex-1 py-3 rounded-xl glass-sm border border-white/10 flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors"
                  >
                    <Mic className="w-5 h-5 text-saffron-400" />
                    <span className="text-sm text-midnight-200">Voice Note</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Row */}
          <div className="flex items-end space-x-2">
            {/* Attachment Button */}
            <button
              onClick={() => setShowAttachment(!showAttachment)}
              className={cn(
                'p-3 rounded-xl transition-colors',
                showAttachment
                  ? 'bg-violet-500/20 border border-violet-500/30'
                  : 'glass-sm border border-white/10 hover:border-white/20'
              )}
            >
              <Paperclip className={cn('w-5 h-5', showAttachment ? 'text-violet-400' : 'text-midnight-400')} />
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-midnight-100 placeholder:text-midnight-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              />
            </div>

            {/* Send Button */}
            {inputText.trim() ? (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                className="p-3 rounded-xl bg-gradient-to-r from-saffron-500 to-rose-500 border border-saffron-500/50 hover:shadow-saffron-glow transition-shadow"
              >
                <Send className="w-5 h-5 text-white" />
              </motion.button>
            ) : (
              <button
                onClick={() => handleAttachment('voice')}
                className="p-3 rounded-xl glass-sm border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Mic className="w-5 h-5 text-midnight-400" />
              </button>
            )}
          </div>
        </div>
      </motion.footer>

      {/* Safety FAB: Share My Date */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleShareMyDate}
        className="fixed bottom-28 right-4 z-20 px-4 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 border border-rose-500/50 flex items-center space-x-2 shadow-lg hover:shadow-rose-glow transition-shadow safe-bottom"
      >
        <Shield className="w-4 h-4 text-white" />
        <span className="text-xs font-semibold text-white">Share My Date</span>
      </motion.button>

      {/* Screenshot Detection Alert (Demo) */}
      <AnimatePresence>
        {false && ( // Enable when screenshot detection is implemented
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 z-30 p-4 rounded-xl bg-rose-500/90 backdrop-blur-md border border-rose-500/50 flex items-center space-x-3 safe-bottom"
          >
            <AlertTriangle className="w-5 h-5 text-white flex-shrink-0" />
            <p className="text-sm text-white flex-1">
              {mockProfile.name} may have taken a screenshot of a photo you sent.
            </p>
            <button className="p-1 hover:bg-white/20 rounded">
              <X className="w-4 h-4 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
