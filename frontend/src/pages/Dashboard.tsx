import Navbar from '../components/layout/Navbar';
import DashboardHome from '../components/dashboard/DashboardHome';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHome />
      </main>
    </div>
  );
}
