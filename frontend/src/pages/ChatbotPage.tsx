import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import AIChatbot from '../components/chatbot/AIChatbot';

export default function ChatbotPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
        >
          <span>← Back to Dashboard</span>
        </Link>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AIChatbot />
      </main>
    </div>
  );
}
