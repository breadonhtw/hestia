'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Toaster as SonnerToaster,
  toast as sonnerToast,
} from 'sonner';
import {
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'success' | 'error' | 'warning';
type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

interface ToasterProps {
  title?: string;
  message: string;
  variant?: Variant;
  duration?: number;
  position?: Position;
  actions?: ActionButton;
  onDismiss?: () => void;
  highlightTitle?: boolean;
}

export interface ToasterRef {
  show: (props: ToasterProps) => void;
}

const variantStyles: Record<Variant, string> = {
  default: 'bg-card/95 backdrop-blur-sm border-border/50 text-foreground shadow-soft',
  success: 'bg-emerald-50/95 dark:bg-emerald-950/30 backdrop-blur-sm border-emerald-200/50 dark:border-emerald-800/50 shadow-soft',
  error: 'bg-red-50/95 dark:bg-red-950/30 backdrop-blur-sm border-red-200/50 dark:border-red-800/50 shadow-soft',
  warning: 'bg-amber-50/95 dark:bg-amber-950/30 backdrop-blur-sm border-amber-200/50 dark:border-amber-800/50 shadow-soft',
};

const titleColor: Record<Variant, string> = {
  default: 'text-foreground',
  success: 'text-emerald-900 dark:text-emerald-100',
  error: 'text-red-900 dark:text-red-100',
  warning: 'text-amber-900 dark:text-amber-100',
};

const iconColor: Record<Variant, string> = {
  default: 'text-muted-foreground',
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
};

const variantIcons: Record<Variant, React.ComponentType<{ className?: string }>> = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
};

const toastAnimation = {
  initial: { opacity: 0, y: 20, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.96 },
};

const ToasterModern = forwardRef<ToasterRef, { defaultPosition?: Position }>(
  ({ defaultPosition = 'bottom-right' }, ref) => {
    const toastReference = useRef<ReturnType<typeof sonnerToast.custom> | null>(null);

    useImperativeHandle(ref, () => ({
      show({
        title,
        message,
        variant = 'default',
        duration = 4000,
        position = defaultPosition,
        actions,
        onDismiss,
        highlightTitle,
      }) {
        const Icon = variantIcons[variant];

        toastReference.current = sonnerToast.custom(
          (toastId) => (
            <motion.div
              variants={toastAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                'flex items-start justify-between w-full max-w-md p-4 rounded-xl border ring-1 ring-black/5',
                variantStyles[variant]
              )}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconColor[variant])} />
                <div className="space-y-1 flex-1 min-w-0">
                  {title && (
                    <h3
                      className={cn(
                        'text-sm font-medium leading-tight',
                        titleColor[variant],
                        highlightTitle && titleColor['success']
                      )}
                    >
                      {title}
                    </h3>
                  )}
                  <p className={cn(
                    'text-sm leading-relaxed',
                    variant === 'default' ? 'text-muted-foreground' : 'opacity-90'
                  )}>{message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                {actions?.label && (
                  <Button
                    variant={actions.variant || 'outline'}
                    size="sm"
                    onClick={() => {
                      actions.onClick();
                      sonnerToast.dismiss(toastId);
                    }}
                    className={cn(
                      'cursor-pointer text-xs font-medium',
                      variant === 'success'
                        ? 'text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                        : variant === 'error'
                        ? 'text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/50'
                        : variant === 'warning'
                        ? 'text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                        : 'text-foreground border-border hover:bg-muted/50'
                    )}
                  >
                    {actions.label}
                  </Button>
                )}

                <button
                  onClick={() => {
                    sonnerToast.dismiss(toastId);
                    onDismiss?.();
                  }}
                  className={cn(
                    "rounded-lg p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                    variant === 'default'
                      ? 'hover:bg-muted/50 text-muted-foreground'
                      : 'hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100'
                  )}
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ),
          { duration, position }
        );
      },
    }));

    return (
      <SonnerToaster
        position={defaultPosition}
        toastOptions={{ unstyled: true, className: 'flex justify-end' }}
      />
    );
  }
);

ToasterModern.displayName = "ToasterModern";

export default ToasterModern;
