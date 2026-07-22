const ProgressBar = ({ value = 0, max = 100, label, showPercentage = true, color = 'primary', height = 'h-3' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorMap = {
    primary: 'from-primary-600 to-primary-400',
    success: 'from-emerald-600 to-emerald-400',
    warning: 'from-amber-600 to-amber-400',
    danger: 'from-red-600 to-red-400',
    accent: 'from-accent-600 to-accent-400',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <p className="text-dark-400 text-xs font-medium">{label}</p>}
          {showPercentage && (
            <p className="text-dark-200 text-xs font-bold">{Math.round(percentage)}%</p>
          )}
        </div>
      )}
      <div className={`w-full bg-dark-800 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} bg-gradient-to-r ${colorMap[color] || colorMap.primary} rounded-full transition-all duration-700 ease-out relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
