import { useState, useEffect, useRef, type FormEvent } from 'react';
import api from '../../services/api';

interface Message {
  id: string;
  message: string;
  response: string;
  createdAt: string;
  isUser?: boolean;
}

const QUICK_PROMPTS = [
  'Explain binary trees',
  'Tips for Google interviews',
  'Recent Amazon interview questions',
  'Debug my code',
  'Best data structures for beginners',
  'How to prepare for technical interviews',
];

export default function AIChatbot() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await api.get('/chatbot/history');
      const history = response.data.history || [];

      // Convert to chat format
      const chatMessages: any[] = [];
      history.forEach((item: Message) => {
        chatMessages.push({
          id: `${item.id}-user`,
          text: item.message,
          isUser: true,
          timestamp: item.createdAt,
        });
        chatMessages.push({
          id: `${item.id}-bot`,
          text: item.response,
          isUser: false,
          timestamp: item.createdAt,
        });
      });

      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chatbot/chat', { message: text });

      const botMessage = {
        id: `bot-${Date.now()}`,
        text: response.data.response,
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: error.response?.data?.error || 'Failed to get AI response. Please try again.',
        isUser: false,
        isError: true,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card p-4 rounded-xl">
        <h2 className="text-2xl font-bold gradient-text mb-2">AI Assistant 🤖</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ask me anything about computer science, interviews, coding problems, or get help with debugging!
        </p>
      </div>

      {/* Quick Prompts */}
      {messages.length === 0 && (
        <div className="glass-card p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Quick Prompts:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(prompt)}
                className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all text-sm text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="glass-card p-4 rounded-xl h-[500px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Start a Conversation
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Ask me anything about CS concepts, interviews, or coding!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.isUser
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : msg.isError
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  <p
                    className={`text-xs mt-2 ${
                      msg.isUser
                        ? 'text-purple-200'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="glass-card p-4 rounded-xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask me anything about CS, interviews, or coding..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          💡 Tip: I only answer CS-related questions. I won't help with homework directly, but I'll guide you!
        </p>
      </form>
    </div>
  );
}
