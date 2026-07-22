import { forwardRef } from 'react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizes = {
  sm: 'px-3 py-2 text-xs',
  md: '',
  lg: 'px-6 py-3 text-base',
};

const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  isLoading = false,
  disabled = false,
  children,
  className = '',
  type = 'button',
  onClick,
  ...props
}, ref) => {
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || '';

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
