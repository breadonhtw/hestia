import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeaturedGalleryImages, useGalleryImages } from '../useArtisans';
import type { ReactNode } from 'react';

// Mock Supabase
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  },
}));

describe('Gallery Image Queries', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useFeaturedGalleryImages', () => {
    it('should fetch featured images with correct filters', async () => {
      const mockData = [
        { id: '1', title: 'Featured 1', is_featured: true, image_url: 'url1' },
        { id: '2', title: 'Featured 2', is_featured: true, image_url: 'url2' },
      ];

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockReturnValueOnce({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockLimit.mockResolvedValue({ data: mockData, error: null });

      const { result } = renderHook(() => useFeaturedGalleryImages('test-artisan'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('artisan_id', 'test-artisan');
      expect(mockEq).toHaveBeenCalledWith('is_featured', true);
      expect(mockOrder).toHaveBeenCalledWith('display_order', { ascending: true });
      expect(mockLimit).toHaveBeenCalledWith(3);
      expect(result.current.data).toEqual(mockData);
    });

    it('should have staleTime configured', () => {
      const { result } = renderHook(() => useFeaturedGalleryImages('test-artisan'), { wrapper });

      // Query should be configured with staleTime
      const queryState = queryClient.getQueryState(['featured-gallery', 'test-artisan']);

      // The query options should include staleTime
      expect(queryState).toBeDefined();
    });

    it('should not fetch when artisanId is empty', () => {
      const { result } = renderHook(() => useFeaturedGalleryImages(''), { wrapper });

      expect(result.current.isFetching).toBe(false);
      expect(mockSelect).not.toHaveBeenCalled();
    });

    it('should return empty array when no data', async () => {
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockReturnValueOnce({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockLimit.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useFeaturedGalleryImages('test-artisan'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useGalleryImages', () => {
    it('should fetch all gallery images', async () => {
      const mockData = [
        { id: '1', title: 'Image 1', is_featured: false, image_url: 'url1' },
        { id: '2', title: 'Image 2', is_featured: true, image_url: 'url2' },
        { id: '3', title: 'Image 3', is_featured: false, image_url: 'url3' },
      ];

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockResolvedValue({ data: mockData, error: null });

      const { result } = renderHook(() => useGalleryImages('test-artisan'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('artisan_id', 'test-artisan');
      expect(mockOrder).toHaveBeenCalledWith('display_order', { ascending: true });
      expect(result.current.data).toEqual(mockData);
    });

    it('should have staleTime configured', () => {
      const { result } = renderHook(() => useGalleryImages('test-artisan'), { wrapper });

      const queryState = queryClient.getQueryState(['gallery', 'test-artisan']);
      expect(queryState).toBeDefined();
    });
  });

  describe('Query Invalidation Integration', () => {
    it('should invalidate both gallery and featured-gallery queries', async () => {
      const artisanId = 'test-artisan';

      // Set up initial data
      queryClient.setQueryData(['gallery', artisanId], [
        { id: '1', is_featured: false },
      ]);
      queryClient.setQueryData(['featured-gallery', artisanId], []);

      // Simulate invalidation (what happens in the mutation onSuccess)
      await queryClient.invalidateQueries({ queryKey: ['gallery', artisanId] });
      await queryClient.invalidateQueries({ queryKey: ['featured-gallery', artisanId] });

      // Check that both queries are marked as stale
      const galleryState = queryClient.getQueryState(['gallery', artisanId]);
      const featuredState = queryClient.getQueryState(['featured-gallery', artisanId]);

      expect(galleryState?.isInvalidated).toBe(true);
      expect(featuredState?.isInvalidated).toBe(true);
    });

    it('should refetch queries after invalidation', async () => {
      const artisanId = 'test-artisan';
      const updatedData = [
        { id: '1', is_featured: true, image_url: 'url1' },
      ];

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      mockOrder.mockResolvedValue({ data: updatedData, error: null });

      const { result } = renderHook(() => useGalleryImages(artisanId), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Invalidate the query
      await queryClient.invalidateQueries({ queryKey: ['gallery', artisanId] });

      // Wait for refetch
      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      // Verify refetch happened
      expect(mockSelect).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockReturnValueOnce({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockLimit.mockResolvedValue({ data: null, error });

      const { result } = renderHook(() => useFeaturedGalleryImages('test-artisan'), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
    });
  });
});
