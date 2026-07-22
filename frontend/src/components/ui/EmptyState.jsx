const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-dark-600" />
      </div>
    )}
    <p className="text-dark-300 font-bold text-base mb-2">{title}</p>
    {description && <p className="text-dark-600 text-sm max-w-sm leading-relaxed mb-6">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
