import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

const Unauthorized = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
    <div className="text-center max-w-md">
      <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
        <ShieldOff className="w-10 h-10 text-red-400" />
      </div>
      <h1 className="text-dark-50 text-2xl font-black mb-3">Access Denied</h1>
      <p className="text-dark-500 mb-8">You don't have permission to access this page.</p>
      <Link to="/login" className="btn-secondary gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </Link>
    </div>
  </div>
);

export default Unauthorized;
