import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyReservations from './MyReservations';
import api from '@/services/api';
import { toast } from 'sonner';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

const mockReservations = [
  {
    id: 'res-1',
    attractionId: 'attr-1',
    attractionTitle: 'Ponta do Seixas',
    reservedFor: '2026-12-01T10:00:00',
    status: 'PENDING' as const,
    touristId: 'tourist-1',
    touristName: 'Maria',
  },
  {
    id: 'res-2',
    attractionId: 'attr-2',
    attractionTitle: 'Farol do Cabo Branco',
    reservedFor: '2026-12-05T15:00:00',
    status: 'CONFIRMED' as const,
    touristId: 'tourist-1',
    touristName: 'Maria',
  },
];

describe('MyReservations Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when tourist has no reservations', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { content: [] } });

    renderWithProviders(<MyReservations />);

    expect(await screen.findByText('Nenhuma reserva encontrada.')).toBeInTheDocument();
    expect(screen.getByText('Explorar atrações disponíveis')).toBeInTheDocument();
  });

  it('renders reservation list with attraction titles and status badges', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { content: mockReservations } });

    renderWithProviders(<MyReservations />);

    expect(await screen.findByText('Ponta do Seixas')).toBeInTheDocument();
    expect(screen.getByText('Farol do Cabo Branco')).toBeInTheDocument();
    expect(screen.getAllByText('Pendente').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Confirmada').length).toBeGreaterThanOrEqual(1);
  });

  it('filters reservations when status filter button is clicked', async () => {
    const user = userEvent.setup();
    mockApi.get.mockResolvedValueOnce({ data: { content: mockReservations } });

    renderWithProviders(<MyReservations />);

    expect(await screen.findByText('Ponta do Seixas')).toBeInTheDocument();
    expect(screen.getByText('Farol do Cabo Branco')).toBeInTheDocument();

    // Click filter 'Pendente'
    const pendingFilterBtn = screen.getByRole('button', { name: 'Pendente' });
    await user.click(pendingFilterBtn);

    expect(screen.getByText('Ponta do Seixas')).toBeInTheDocument();
    expect(screen.queryByText('Farol do Cabo Branco')).not.toBeInTheDocument();
  });

  it('cancels a pending reservation on button click and displays success toast', async () => {
    const user = userEvent.setup();
    mockApi.get.mockResolvedValueOnce({ data: { content: mockReservations } });
    mockApi.patch.mockResolvedValueOnce({ data: {} });

    renderWithProviders(<MyReservations />);

    const cancelButtons = await screen.findAllByRole('button', { name: 'Cancelar' });
    expect(cancelButtons.length).toBeGreaterThan(0);

    await user.click(cancelButtons[0]);

    await waitFor(() => {
      expect(mockApi.patch).toHaveBeenCalledWith('/api/v1/reservations/res-1/cancel');
      expect(toast.success).toHaveBeenCalledWith('Reserva cancelada com sucesso.');
    });
  });
});
