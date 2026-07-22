import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const ProcessingModal = ({ isOpen, status, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-dark-950/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4 transition-all duration-300">
      <div className="flex flex-col items-center transform scale-110 animate-in zoom-in duration-300">
        {status === 'loading' && (
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-dark-800 border-t-primary-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-dark-900 shadow-inner flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-pulse" />
              </div>
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              <CheckCircle className="w-10 h-10 text-white animate-in slide-in-from-bottom-4 duration-500" strokeWidth={3} />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.4)]">
              <XCircle className="w-10 h-10 text-white animate-in slide-in-from-bottom-4 duration-500" strokeWidth={3} />
            </div>
          </div>
        )}

        <h3 className={`mt-8 text-2xl font-black tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 ${
          status === 'loading' ? 'text-white' : 
          status === 'success' ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {status === 'loading' ? 'Processing...' : 
           status === 'success' ? 'Success!' : 'Error'}
        </h3>
        
        <p className="text-dark-300 mt-2 text-center max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
          {message}
        </p>
      </div>
    </div>
  );
};

export default ProcessingModal;
