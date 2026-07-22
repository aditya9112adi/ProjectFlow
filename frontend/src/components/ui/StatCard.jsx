const StatCard = ({ title, value, icon: Icon, gradient, subtitle }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between">
      <p className="text-dark-400 text-sm font-semibold">{title}</p>
      {Icon && (
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
          style={{ background: gradient || 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
    <p className="text-dark-50 text-3xl font-black">{value}</p>
    {subtitle && <p className="text-dark-600 text-xs">{subtitle}</p>}
    <div
      className="absolute bottom-0 right-0 w-24 h-24 rounded-full opacity-5 pointer-events-none"
      style={{ background: gradient || '#6366f1', transform: 'translate(30%, 30%)' }}
    />
  </div>
);

export default StatCard;
