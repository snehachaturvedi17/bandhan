"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  MessageCircle,
  Shield,
  ShieldCheck,
  Clock,
  Image,
  Mic,
  Send,
  Heart,
  X,
  Filter,
  RefreshCw,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ChatConversation {
  id: string;
  profileId: string;
  name: string;
  avatarUrl: string;
  verificationLevel: "bronze" | "silver" | "gold";
  lastActive: string;
  isOnline: boolean;
  lastMessage: {
    text?: string;
    type: "text" | "photo" | "voice" | "interest";
    isFromMe: boolean;
    timestamp: string;
  };
  unreadCount: number;
  matchedDate: string;
  matchedDaysAgo: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────
const mockConversations: ChatConversation[] = [
  {
    id: "1",
    profileId: "p1",
    name: "Priya Sharma",
    avatarUrl: "/avatars/priya.jpg",
    verificationLevel: "gold",
    lastActive: "Online",
    isOnline: true,
    lastMessage: {
      text: "Thanks for the voice note! I loved hearing about your...",
      type: "text",
      isFromMe: false,
      timestamp: "2m ago",
    },
    unreadCount: 2,
    matchedDate: "3 days ago",
    matchedDaysAgo: 3,
  },
  {
    id: "2",
    profileId: "p2",
    name: "Ananya Iyer",
    avatarUrl: "/avatars/ananya.jpg",
    verificationLevel: "silver",
    lastActive: "2h ago",
    isOnline: false,
    lastMessage: {
      text: "Would love to know more about your family values",
      type: "text",
      isFromMe: true,
      timestamp: "5h ago",
    },
    unreadCount: 0,
    matchedDate: "1 week ago",
    matchedDaysAgo: 7,
  },
  {
    id: "3",
    profileId: "p3",
    name: "Sneha Patel",
    avatarUrl: "/avatars/sneha.jpg",
    verificationLevel: "gold",
    lastActive: "Yesterday",
    isOnline: false,
    lastMessage: {
      text: "Sent you a voice introduction",
      type: "voice",
      isFromMe: false,
      timestamp: "1d ago",
    },
    unreadCount: 1,
    matchedDate: "2 weeks ago",
    matchedDaysAgo: 14,
  },
  {
    id: "4",
    profileId: "p4",
    name: "Kavya Nair",
    avatarUrl: "/avatars/kavya.jpg",
    verificationLevel: "bronze",
    lastActive: "3d ago",
    isOnline: false,
    lastMessage: {
      text: "Sent you an interest",
      type: "interest",
      isFromMe: true,
      timestamp: "3d ago",
    },
    unreadCount: 0,
    matchedDate: "3 weeks ago",
    matchedDaysAgo: 21,
  },
  {
    id: "5",
    profileId: "p5",
    name: "Riya Gupta",
    avatarUrl: "/avatars/riya.jpg",
    verificationLevel: "silver",
    lastActive: "5d ago",
    isOnline: false,
    lastMessage: {
      text: "📷 Photo",
      type: "photo",
      isFromMe: false,
      timestamp: "5d ago",
    },
    unreadCount: 0,
    matchedDate: "1 month ago",
    matchedDaysAgo: 30,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────
function VerificationBadge({
  level,
  size = "sm",
}: {
  level: "bronze" | "silver" | "gold";
  size?: "sm" | "xs";
}) {
  const config = {
    bronze: {
      color: "text-amber-700 bg-amber-500/20 border-amber-500/30",
      icon: Shield,
    },
    silver: {
      color: "text-midnight-200 bg-white/20 border-white/30",
      icon: Shield,
    },
    gold: {
      color: "text-gold-500 bg-gold-500/20 border-gold-500/30",
      icon: ShieldCheck,
    },
  };

  const Icon = config[level].icon;
  const sizeClasses = size === "sm" ? "w-3.5 h-3.5 p-1.5" : "w-2.5 h-2.5 p-0.5";

  return (
    <div
      className={cn(
        "rounded-full border flex items-center justify-center",
        sizeClasses,
        config[level].color,
      )}
    >
      <Icon className="w-full h-full" />
    </div>
  );
}

function ChatListItem({
  conversation,
  onClick,
}: {
  conversation: ChatConversation;
  onClick: () => void;
}) {
  const getMessagePreview = (msg: ChatConversation["lastMessage"]) => {
    switch (msg.type) {
      case "photo":
        return (
          <span className="flex items-center space-x-1.5 text-midnight-400">
            <Image className="w-4 h-4" />
            <span>Photo</span>
          </span>
        );
      case "voice":
        return (
          <span className="flex items-center space-x-1.5 text-midnight-400">
            <Mic className="w-4 h-4" />
            <span>Voice note</span>
          </span>
        );
      case "interest":
        return (
          <span className="flex items-center space-x-1.5 text-saffron-400">
            <Heart className="w-4 h-4" />
            <span>Interest sent</span>
          </span>
        );
      default:
        return (
          <span className="text-midnight-300 truncate">
            {msg.isFromMe && <span className="text-midnight-400">You: </span>}
            {msg.text}
          </span>
        );
    }
  };

  const formatLastActive = (lastActive: string) => {
    if (lastActive === "Online") return "Online";
    return lastActive;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "flex items-center space-x-3 p-4 rounded-2xl cursor-pointer",
        "glass-sm border border-white/5 hover:border-white/10 hover:bg-white/5",
        "transition-all duration-200",
      )}
    >
      {/* Avatar with Verification */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/10">
          <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-saffron-500/20 flex items-center justify-center">
            <span className="text-lg font-bold text-violet-400">
              {conversation.name.charAt(0)}
            </span>
          </div>
        </div>
        {/* Verification Badge Overlay */}
        <div className="absolute -bottom-1 -right-1">
          <VerificationBadge level={conversation.verificationLevel} size="xs" />
        </div>
        {/* Online Indicator */}
        {conversation.isOnline && (
          <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-midnight-900" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name & Last Active */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-midnight-100 truncate">
            {conversation.name}
          </h3>
          <span
            className={cn(
              "text-xs flex-shrink-0",
              conversation.isOnline ? "text-emerald-400" : "text-midnight-500",
            )}
          >
            {formatLastActive(conversation.lastActive)}
          </span>
        </div>

        {/* Last Message & Time */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 flex items-center space-x-2">
            {getMessagePreview(conversation.lastMessage)}
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xs text-midnight-500">
              {conversation.lastMessage.timestamp}
            </span>
            {conversation.unreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-gradient-to-r from-saffron-500 to-rose-500 text-[10px] font-bold text-white">
                {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Match Date Badge */}
        <div className="mt-2 flex items-center space-x-1.5">
          <Clock className="w-3 h-3 text-midnight-500" />
          <span className="text-[10px] text-midnight-500">
            Matched {conversation.matchedDate}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-saffron-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center mb-6">
        <MessageCircle className="w-10 h-10 text-midnight-400" />
      </div>
      <h3 className="text-xl font-bold text-midnight-50 mb-2">
        No conversations yet
      </h3>
      <p className="text-midnight-300 text-sm mb-6">
        Start exploring matches to begin chatting!
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-violet-500 text-white font-semibold hover:shadow-saffron-glow transition-shadow"
      >
        Explore Matches
      </motion.button>
    </motion.div>
  );
}

function SearchModal({
  isOpen,
  onClose,
  conversations,
}: {
  isOpen: boolean;
  onClose: () => void;
  conversations: ChatConversation[];
}) {
  const [query, setQuery] = useState("");

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-b from-midnight-900 to-midnight-950 rounded-t-3xl border-t border-white/10 max-h-[80vh] overflow-hidden"
          >
            <div className="p-4 safe-top">
              {/* Search Input */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search conversations..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-midnight-100 placeholder:text-midnight-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
                <button
                  onClick={onClose}
                  className="p-3 rounded-xl glass-sm hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-midnight-300" />
                </button>
              </div>

              {/* Results */}
              <div className="overflow-y-auto max-h-[60vh] space-y-2">
                {filtered.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-midnight-400 text-sm">
                      {query ? "No matches found" : "Start typing to search"}
                    </p>
                  </div>
                ) : (
                  filtered.map((conv) => (
                    <ChatListItem
                      key={conv.id}
                      conversation={conv}
                      onClick={onClose}
                    />
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatListPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "online">("all");

  // Pull to refresh simulation
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    // Simulate loading conversations
    const timer = setTimeout(() => {
      setConversations(mockConversations);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Simulate new messages
    setConversations((prev) => [
      {
        ...prev[0],
        unreadCount: prev[0].unreadCount + 1,
        lastMessage: {
          ...prev[0].lastMessage,
          timestamp: "Just now",
        },
      },
      ...prev.slice(1),
    ]);
    setIsRefreshing(false);
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    if (filter === "unread") return conv.unreadCount > 0;
    if (filter === "online") return conv.isOnline;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8 safe-top safe-bottom pb-24">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-saffron-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">Messages</h1>
            <p className="text-sm text-midnight-300">
              {conversations.length} conversations
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSearch(true)}
              className="p-3 rounded-xl glass-sm border border-white/10 hover:border-white/20 transition-colors"
            >
              <Search className="w-5 h-5 text-midnight-300" />
            </button>
            <button className="p-3 rounded-xl glass-sm border border-white/10 hover:border-white/20 transition-colors">
              <Filter className="w-5 h-5 text-midnight-300" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          {(["all", "unread", "online"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                filter === f
                  ? "bg-gradient-to-r from-saffron-500/20 to-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "glass-sm text-midnight-300 hover:bg-white/5",
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "unread" && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-saffron-500/20 text-saffron-400 text-[10px]">
                  {conversations.filter((c) => c.unreadCount > 0).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.header>

      {/* Refresh Indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 mb-4 overflow-hidden"
          >
            <div className="flex items-center justify-center py-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-5 h-5 text-violet-400" />
              </motion.div>
              <span className="ml-2 text-sm text-midnight-400">
                Updating conversations...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat List */}
      <motion.main className="relative z-10 space-y-2">
        {isLoading ? (
          // Loading Skeletons
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 p-4 rounded-2xl glass-sm border border-white/5"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredConversations.map((conv, index) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ChatListItem
                    conversation={conv}
                    onClick={() => {
                      // Navigate to chat detail
                      console.log("Navigate to chat:", conv.id);
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.main>

      {/* Floating Action Button */}
      <motion.footer
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-6 right-6 z-20 safe-bottom"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-saffron-500 to-rose-500 border-2 border-saffron-500/50 flex items-center justify-center shadow-lg hover:shadow-saffron-glow transition-shadow"
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      </motion.footer>

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        conversations={conversations}
      />
    </div>
  );
}
