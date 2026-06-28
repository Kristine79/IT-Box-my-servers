import { render, screen } from '@testing-library/react';
import { UrgentTasks } from '@/app/(app)/app/_components/UrgentTasks';

describe('UrgentTasks', () => {
  const mockTasks = [
    {
      id: '1',
      content: 'Fix critical bug',
      projectName: 'Website',
      priority: 'high',
      status: 'urgent',
    },
    {
      id: '2',
      content: 'Update SSL certificate',
      priority: 'medium',
    },
  ];

  const mockOnDateSelect = jest.fn();

  it('renders urgent tasks heading', () => {
    render(
      <UrgentTasks
        tasks={mockTasks}
        selectedDate={undefined}
        onDateSelect={mockOnDateSelect}
      />
    );

    expect(screen.getByText('Urgent Tasks')).toBeInTheDocument();
  });

  it('renders task content', () => {
    render(
      <UrgentTasks
        tasks={mockTasks}
        selectedDate={undefined}
        onDateSelect={mockOnDateSelect}
      />
    );

    expect(screen.getByText('Fix critical bug')).toBeInTheDocument();
    expect(screen.getByText('Update SSL certificate')).toBeInTheDocument();
  });

  it('shows project name for tasks with project', () => {
    render(
      <UrgentTasks
        tasks={mockTasks}
        selectedDate={undefined}
        onDateSelect={mockOnDateSelect}
      />
    );

    expect(screen.getByText('in Website')).toBeInTheDocument();
  });

  it('displays priority badges', () => {
    render(
      <UrgentTasks
        tasks={mockTasks}
        selectedDate={undefined}
        onDateSelect={mockOnDateSelect}
      />
    );

    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    render(
      <UrgentTasks
        tasks={[]}
        selectedDate={undefined}
        onDateSelect={mockOnDateSelect}
      />
    );

    expect(screen.getByText('No urgent tasks')).toBeInTheDocument();
  });

  it('shows untitled for tasks without content', () => {
    const unnamedTask = [{ id: '3', priority: 'low' }];
    render(
      <UrgentTasks
        tasks={unnamedTask}
        selectedDate={undefined}
        onDateSelect={mockOnDateSelect}
      />
    );

    expect(screen.getByText('Untitled task')).toBeInTheDocument();
  });
});
