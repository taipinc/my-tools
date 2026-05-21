import React from 'react';

export const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseStyles = "rounded-md font-medium transition-colors focus-visible:outline-none";
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-200 hover:bg-slate-100"
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};