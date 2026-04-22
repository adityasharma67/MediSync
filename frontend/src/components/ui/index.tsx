import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import clsx from 'clsx';

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
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white disabled:bg-gray-400 dark:bg-primary-500 dark:hover:bg-primary-600',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-gray-800',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const content = (
    <>
      {loading && <span className="animate-spin">...</span>}
      {children}
    </>
  );

  if (href) {
    return (
      <motion.div whileHover={{ scale: disabled ? 1 : 1.02 }} whileTap={{ scale: disabled ? 1 : 0.98 }}>
        <Link href={href} className={clsx(baseStyles, variants[variant], sizes[size], className)}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      disabled={disabled || loading}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {content}
    </motion.button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = ({ label, error, icon, className = '', ...props }: InputProps) => {
  return (
    <div className="w-full">
      {label && <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">{icon}</span>}
        <input
          className={clsx(
            'w-full rounded-lg border-2 border-gray-300 px-4 py-2 dark:border-gray-600',
            'transition-colors focus:border-primary-500 focus:outline-none dark:bg-gray-800 dark:text-white dark:focus:border-primary-400',
            icon && 'pl-10',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
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
      whileHover={hoverable ? { translateY: -4 } : {}}
      className={clsx(
        'rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800',
        hoverable && 'cursor-pointer transition-all duration-300',
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="mb-4 text-2xl font-bold dark:text-white">{title}</h2>}
        {children}
      </motion.div>
    </motion.div>
  );
};

export const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    className="h-8 w-8 rounded-full border-4 border-primary-600 border-t-transparent"
  />
);
