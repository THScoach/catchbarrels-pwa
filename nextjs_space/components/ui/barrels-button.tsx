import React from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * BARRELS Button Components
 * 
 * Two main styles:
 * 1. Primary (blue) - Main actions
 * 2. Secondary (outline) - Lower priority actions
 */

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function PrimaryButton({ 
  children, 
  onClick, 
  disabled = false, 
  icon: Icon,
  className = '',
  type = 'button'
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center w-full rounded-full
        bg-barrels-blue hover:bg-barrels-blue-light active:bg-barrels-blue-dark
        text-white font-semibold text-sm md:text-base
        py-3 px-4 transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {Icon && <Icon className="mr-2 h-5 w-5" />}
      {children}
    </button>
  );
}

export function SecondaryButton({ 
  children, 
  onClick, 
  disabled = false, 
  icon: Icon,
  className = '',
  type = 'button'
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-full
        border border-barrels-border bg-transparent
        text-barrels-text hover:bg-white/5 active:bg-white/10
        text-sm font-medium py-2.5 px-4 transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
}
