import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
    <div className="text-center max-w-md">
      <div className="text-8xl font-black text-gradient mb-6">404</div>
      <h1 className="text-dark-50 text-2xl font-black mb-3">Page Not Found</h1>
      <p className="text-dark-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary gap-2">
        <Home className="w-4 h-4" /> Back to Home
      </Link>
    </div>
  </div>
);

export default NotFound;
