import { forwardRef } from 'react';

const Input = forwardRef(({
  label, error, icon: Icon, hint, className = '', id, ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />}
        <input
          ref={ref}
          id={inputId}
          className={`input ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500/50 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-dark-600 text-xs">{hint}</p>}
      {error && <p className="text-red-400 text-xs">⚠ {error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
