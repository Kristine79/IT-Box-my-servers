import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardStats } from '@/app/(app)/app/_components/DashboardStats';

describe('DashboardStats', () => {
  const mockStats = {
    projects: 5,
    servers: 3,
    services: 8,
    credentials: 12,
  };

  const mockPlanLimits = {
    projects: 10,
    servers: 5,
    services: 20,
    credentials: Infinity,
  };

  it('renders all stat items correctly', () => {
    render(<DashboardStats stats={mockStats} planLimits={mockPlanLimits} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Servers')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Credentials')).toBeInTheDocument();
  });

  it('shows warning color when approaching limit', () => {
    const highStats = {
      projects: 9, // 90% of 10
      servers: 4,  // 80% of 5
      services: 10,
      credentials: 5,
    };

    render(<DashboardStats stats={highStats} planLimits={mockPlanLimits} />);

    const warningElements = screen.getAllByText(/9\/10|4\/5/);
    expect(warningElements.length).toBeGreaterThan(0);
  });

  it('navigates to correct page when clicked', () => {
    const originalHref = window.location.href;
    delete (window as any).location;
    (window as any).location = { href: '' };

    render(<DashboardStats stats={mockStats} planLimits={mockPlanLimits} />);

    const projectsCard = screen.getByText('Projects').closest('div');
    fireEvent.click(projectsCard!);
    expect(window.location.href).toBe('/projects');

    window.location.href = originalHref;
  });

  it('displays infinity symbol for unlimited items', () => {
    render(<DashboardStats stats={mockStats} planLimits={mockPlanLimits} />);

    expect(screen.getByText('limit ∞')).toBeInTheDocument();
  });
});
