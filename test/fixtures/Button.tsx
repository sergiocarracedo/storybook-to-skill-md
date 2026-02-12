import React from 'react';

export interface ButtonProps {
  /** The button's label text */
  children: React.ReactNode;
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Size of the button */
  size?: 'small' | 'medium' | 'large';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * A reusable button component that supports multiple variants and sizes.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className ?? ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
