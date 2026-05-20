"use client";

import { InputHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void | Promise<void>;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  href,
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary: 'btn-solid',
    secondary: 'bg-[var(--surface-strong)] text-[var(--text)] hover:bg-[var(--surface-muted)]',
    danger: 'bg-[var(--danger)] text-white hover:brightness-95',
    outline: 'btn-outline',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </>
  );

  if (href) {
    return (
      <motion.div whileHover={{ scale: disabled ? 1 : 1.01 }} whileTap={{ scale: disabled ? 1 : 0.99 }}>
        <Link href={href} className={clsx(baseStyles, variants[variant], sizes[size], className)}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
      type={type}
      disabled={disabled || loading}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {content}
    </motion.button>
  );
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = ({ label, error, icon, className = '', ...props }: InputProps) => {
  return (
    <div className="w-full">
      {label && <label className="mb-2 block text-sm font-medium text-[var(--text)]">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">{icon}</span>}
        <input
          className={clsx(
            'form-field',
            icon && 'pl-10',
            error && 'border-[var(--danger)]',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
};

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card = ({ children, className = '', hoverable = false }: CardProps) => {
  return (
    <motion.div
      whileHover={hoverable ? { translateY: -3 } : {}}
      className={clsx(
        'surface-panel p-5',
        hoverable && 'cursor-pointer transition',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="surface-panel w-full max-w-md p-6"
        onClick={(event) => event.stopPropagation()}
      >
        {title && <h2 className="mb-4 text-xl font-bold text-[var(--text)]">{title}</h2>}
        {children}
      </motion.div>
    </motion.div>
  );
};

export const LoadingSpinner = () => (
  <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
);
