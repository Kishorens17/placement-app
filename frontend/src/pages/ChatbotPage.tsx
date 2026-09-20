import { useNavigate } from 'react-router-dom';
import AIChatbot from '../components/chatbot/AIChatbot';

export default function ChatbotPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="glass-card border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-purple-600 dark:text-purple-400 hover:underline mr-4"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">AI Assistant</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AIChatbot />
      </main>
    </div>
  );
}
