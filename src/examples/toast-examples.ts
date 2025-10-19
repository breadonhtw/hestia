/**
 * Toast Notification Examples for Hestia
 *
 * These examples demonstrate the enhanced toast designs
 * with Hestia's warm, classical aesthetic.
 */

import { toast } from 'sonner';

// ============================================
// BASIC TOASTS
// ============================================

export const showSuccessToast = () => {
  toast.success('Your artisan profile is now live!');
};

export const showErrorToast = () => {
  toast.error('Failed to save changes. Please try again.');
};

export const showWarningToast = () => {
  toast.warning('Your session will expire in 5 minutes.');
};

export const showInfoToast = () => {
  toast.info('New features have been added to your dashboard.');
};

// ============================================
// TOASTS WITH DESCRIPTIONS
// ============================================

export const showSuccessWithDescription = () => {
  toast.success('Profile Published', {
    description: 'Your artisan profile is now visible to the Hestia community.',
  });
};

export const showErrorWithDescription = () => {
  toast.error('Upload Failed', {
    description: 'The image must be less than 5MB. Please try a smaller file.',
  });
};

// ============================================
// TOASTS WITH ACTIONS
// ============================================

export const showToastWithAction = () => {
  toast.success('Image uploaded successfully', {
    action: {
      label: 'View',
      onClick: () => console.log('View clicked'),
    },
  });
};

export const showToastWithMultipleActions = () => {
  toast.info('You have a new message', {
    description: 'Someone is interested in your pottery collection.',
    action: {
      label: 'Reply',
      onClick: () => console.log('Reply clicked'),
    },
    cancel: {
      label: 'Dismiss',
      onClick: () => console.log('Dismissed'),
    },
  });
};

// ============================================
// CUSTOM DURATION & POSITION
// ============================================

export const showLongToast = () => {
  toast.success('Changes saved', {
    duration: 10000, // 10 seconds
  });
};

export const showPromiseToast = async () => {
  const promise = new Promise((resolve) => setTimeout(resolve, 2000));

  toast.promise(promise, {
    loading: 'Publishing your profile...',
    success: 'Profile published successfully!',
    error: 'Failed to publish profile',
  });
};

// ============================================
// USAGE IN COMPONENTS
// ============================================

/**
 * Example usage in a React component:
 *
 * ```tsx
 * import { toast } from 'sonner';
 *
 * function MyComponent() {
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       toast.success('Changes saved successfully');
 *     } catch (error) {
 *       toast.error('Failed to save changes', {
 *         description: error.message,
 *       });
 *     }
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 */

// ============================================
// STYLING NOTES
// ============================================

/**
 * The toasts feature:
 *
 * ✨ Design Features:
 * - Glassmorphism with backdrop-blur for modern feel
 * - Warm color palette matching Hestia's aesthetic
 * - Soft shadows and subtle borders
 * - Smooth animations with reduced motion support
 * - Responsive sizing for mobile and desktop
 *
 * 🎨 Variants:
 * - Default: Neutral gray with subtle styling
 * - Success: Emerald green for positive actions
 * - Error: Red for errors and failures
 * - Warning: Amber for warnings and cautions
 * - Info: Blue for informational messages
 *
 * ⚡ Features:
 * - Auto-dismiss after 4 seconds (customizable)
 * - Manual close button
 * - Action buttons for quick actions
 * - Stacking of multiple toasts
 * - Bottom-right positioning by default
 * - Dark mode support
 */
