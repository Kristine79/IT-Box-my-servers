import { render, screen } from '@testing-library/react';
import { RecentItems } from '@/app/(app)/app/_components/RecentItems';

describe('RecentItems', () => {
  const mockProjects = [
    { id: '1', name: 'Project Alpha', status: 'active' },
    { id: '2', name: 'Project Beta', status: 'paused' },
  ];

  const mockServers = [
    { id: '1', name: 'Server 1', ipAddress: '192.168.1.1' },
    { id: '2', name: 'Server 2' },
  ];

  it('renders recent projects', () => {
    render(<RecentItems recentProjects={mockProjects} recentServers={mockServers} />);

    expect(screen.getByText('Recent Projects')).toBeInTheDocument();
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Beta')).toBeInTheDocument();
  });

  it('renders recent servers', () => {
    render(<RecentItems recentProjects={mockProjects} recentServers={mockServers} />);

    expect(screen.getByText('Recent Servers')).toBeInTheDocument();
    expect(screen.getByText('Server 1')).toBeInTheDocument();
    expect(screen.getByText('Server 2')).toBeInTheDocument();
  });

  it('shows empty state when no projects', () => {
    render(<RecentItems recentProjects={[]} recentServers={mockServers} />);

    expect(screen.getByText('No projects yet')).toBeInTheDocument();
  });

  it('shows empty state when no servers', () => {
    render(<RecentItems recentProjects={mockProjects} recentServers={[]} />);

    expect(screen.getByText('No servers yet')).toBeInTheDocument();
  });

  it('displays status badge for projects', () => {
    render(<RecentItems recentProjects={mockProjects} recentServers={[]} />);

    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('paused')).toBeInTheDocument();
  });

  it('shows untitled for items without name', () => {
    const unnamedProject = [{ id: '3', status: 'active' }];
    render(<RecentItems recentProjects={unnamedProject} recentServers={[]} />);

    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('limits items to 5 per section', () => {
    const manyProjects = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      name: `Project ${i}`,
    }));

    render(<RecentItems recentProjects={manyProjects} recentServers={[]} />);

    const projectLinks = screen.getAllByText(/Project \d/);
    expect(projectLinks.length).toBe(5);
  });
});
