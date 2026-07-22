const variants = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
};

const Badge = ({ variant = 'primary', children, className = '' }) => (
  <span className={`${variants[variant] || variants.primary} ${className}`}>
    {children}
  </span>
);

export default Badge;
