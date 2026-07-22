const LoadingScreen = () => (
  <div className="fixed inset-0 bg-dark-950 flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-2xl shadow-primary-600/30">
          <span className="text-white font-black text-2xl">P</span>
        </div>
        <div className="absolute -inset-3 rounded-2xl border-2 border-primary-500/30 animate-ping" />
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-dark-400 text-sm font-medium tracking-wide">Loading ProjectFlow...</p>
    </div>
  </div>
);

export default LoadingScreen;
