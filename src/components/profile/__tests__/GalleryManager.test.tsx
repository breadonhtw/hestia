import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GalleryManager } from '../GalleryManager';
import { MAX_FEATURED_IMAGES } from '@/constants/gallery';

// Mock the hooks and dependencies
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null,
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null,
        })),
      })),
      insert: vi.fn(() => ({
        error: null,
      })),
    })),
  },
}));

vi.mock('@/lib/storage', () => ({
  uploadGalleryImage: vi.fn(),
  deleteGalleryImage: vi.fn(),
}));

describe('GalleryManager - Featured Limit Validation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockToast.mockClear();
  });

  const renderComponent = (artisanId = 'test-artisan-id') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <GalleryManager artisanId={artisanId} />
      </QueryClientProvider>
    );
  };

  it('should display the correct featured limit message', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(new RegExp(`feature up to ${MAX_FEATURED_IMAGES} images`, 'i'))).toBeInTheDocument();
    });
  });

  it('should prevent featuring a 4th image and show error toast', async () => {
    const supabase = await import('@/integrations/supabase/client').then(m => m.supabase);

    // Mock 3 featured images already exist
    const mockImages = [
      { id: '1', title: 'Image 1', is_featured: true, image_url: 'url1', display_order: 1, artisan_id: 'test' },
      { id: '2', title: 'Image 2', is_featured: true, image_url: 'url2', display_order: 2, artisan_id: 'test' },
      { id: '3', title: 'Image 3', is_featured: true, image_url: 'url3', display_order: 3, artisan_id: 'test' },
      { id: '4', title: 'Image 4', is_featured: false, image_url: 'url4', display_order: 4, artisan_id: 'test' },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: mockImages,
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          error: null,
        })),
      })),
    } as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByAlt('Image 4')).toBeInTheDocument();
    });

    // Try to feature the 4th image
    const starButtons = screen.getAllByRole('button', { name: /feature/i });
    const fourthImageStarButton = starButtons.find(btn =>
      btn.getAttribute('aria-label')?.includes('Image 4')
    );

    if (fourthImageStarButton) {
      await userEvent.click(fourthImageStarButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Featured limit reached',
            description: expect.stringContaining(`${MAX_FEATURED_IMAGES} images`),
            variant: 'destructive',
          })
        );
      });
    }
  });

  it('should allow featuring an image when less than 3 are featured', async () => {
    const supabase = await import('@/integrations/supabase/client').then(m => m.supabase);

    // Mock only 2 featured images
    const mockImages = [
      { id: '1', title: 'Image 1', is_featured: true, image_url: 'url1', display_order: 1, artisan_id: 'test' },
      { id: '2', title: 'Image 2', is_featured: true, image_url: 'url2', display_order: 2, artisan_id: 'test' },
      { id: '3', title: 'Image 3', is_featured: false, image_url: 'url3', display_order: 3, artisan_id: 'test' },
    ];

    const updateMock = vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    }));

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: mockImages,
            error: null,
          })),
        })),
      })),
      update: updateMock,
    } as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByAlt('Image 3')).toBeInTheDocument();
    });

    const starButtons = screen.getAllByRole('button', { name: /feature/i });
    const thirdImageStarButton = starButtons.find(btn =>
      btn.getAttribute('aria-label')?.includes('Image 3')
    );

    if (thirdImageStarButton) {
      await userEvent.click(thirdImageStarButton);

      await waitFor(() => {
        expect(updateMock).toHaveBeenCalled();
        expect(mockToast).not.toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Featured limit reached',
          })
        );
      });
    }
  });

  it('should allow unfeaturing an image regardless of count', async () => {
    const supabase = await import('@/integrations/supabase/client').then(m => m.supabase);

    const mockImages = [
      { id: '1', title: 'Image 1', is_featured: true, image_url: 'url1', display_order: 1, artisan_id: 'test' },
      { id: '2', title: 'Image 2', is_featured: true, image_url: 'url2', display_order: 2, artisan_id: 'test' },
      { id: '3', title: 'Image 3', is_featured: true, image_url: 'url3', display_order: 3, artisan_id: 'test' },
    ];

    const updateMock = vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    }));

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: mockImages,
            error: null,
          })),
        })),
      })),
      update: updateMock,
    } as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByAlt('Image 1')).toBeInTheDocument();
    });

    // Unfeature the first image
    const starButtons = screen.getAllByRole('button', { name: /unfeature/i });

    if (starButtons.length > 0) {
      await userEvent.click(starButtons[0]);

      await waitFor(() => {
        expect(updateMock).toHaveBeenCalled();
        expect(mockToast).not.toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
          })
        );
      });
    }
  });
});
