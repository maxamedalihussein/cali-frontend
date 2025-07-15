import { Link } from "react-router-dom";
import Loading from '../components/Loading';
import MiniSpinner from '../components/MiniSpinner';

const Index = () => {
  // Example loading state for demonstration
  const loading = false;
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-red-100">
      <div className="text-center bg-white/90 rounded-2xl shadow-lg p-8 max-w-md w-full">
        <img src="/publiccali-dayax-logo.png.jpg" alt="CALI DAYAX Logo" className="mx-auto mb-4 w-20 h-20 rounded-full border-4 border-blue-700 shadow" />
        <h1 className="text-4xl font-extrabold mb-2 text-blue-900">CALI DAYAX Wheels Tracker</h1>
        <p className="text-lg text-gray-700 mb-6">Modern car sales & inventory management for your business.</p>
        <Link to="/login">
          <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg shadow transition">Sign In to Dashboard</button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
