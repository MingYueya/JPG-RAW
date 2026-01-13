
import React from 'react';

interface BrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

const BrutalistButton: React.FC<BrutalistButtonProps> = ({ className = '', children, ...props }) => {
  return (
    <button 
      {...props}
      className={`
        flex items-center gap-2 px-6 py-3 font-black text-lg border-4 border-black 
        brutal-shadow transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]
        active:translate-y-1 active:translate-x-1 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default BrutalistButton;
