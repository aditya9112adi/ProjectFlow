import { forwardRef } from 'react';

const Input = forwardRef(({
  label, error, icon: Icon, hint, prefix, prefixWidth = 'pl-20', className = '', id, ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-4 text-dark-400 pointer-events-none select-none font-mono">
            {prefix}
          </span>
        )}
        {Icon && <Icon className={`absolute ${prefix ? 'left-10' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none`} />}
        <input
          ref={ref}
          id={inputId}
          className={`input ${Icon && prefix ? 'pl-24' : Icon ? 'pl-10' : prefix ? prefixWidth : ''} ${error ? 'border-red-500/50 focus:ring-red-500' : ''} ${className}`}
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
