import React from 'react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ title = 'Error', message, className }) => {
  return (
    <div className={cn('bg-red-100 text-red-800 p-4 rounded-md', className)}>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
