import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mechho-mustard disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-mechho-mustard text-mechho-blue hover:bg-mechho-mustard-lt shadow-sm': variant === 'primary',
            'bg-mechho-blue text-white hover:bg-mechho-blue-mid shadow-sm': variant === 'secondary',
            'border-2 border-mechho-blue text-mechho-blue hover:bg-mechho-blue hover:text-white': variant === 'outline',
            'text-mechho-blue hover:bg-mechho-blue/10': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          },
          {
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-5 py-2.5 text-sm': size === 'md',
            'px-7 py-3.5 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export default Button
