import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiagramGenerator } from './diagram-generator';

const toastMock = jest.fn();
const getSessionMock = jest.fn();
const fromMock = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

jest.mock('@/components/auth-provider', () => ({
  useAuth: () => ({ user: { id: 'user-1', email: 'user@example.com' } }),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: getSessionMock,
    },
    from: fromMock,
  }),
}));

jest.mock('@/lib/collaboration-service', () => ({
  broadcastDiagramChange: jest.fn(),
  subscribeToDiagramChanges: jest.fn(() => jest.fn()),
}));

jest.mock('@/components/diagram/diagram-preview', () => ({
  DiagramPreview: ({ code }: { code: string }) => (
    <div id="mermaid-diagram" data-testid="diagram-preview">
      {code}
    </div>
  ),
}));

jest.mock('@/components/diagram/diagram-templates', () => ({
  DiagramTemplates: () => <div>Diagram templates</div>,
}));

jest.mock('html-to-image', () => ({
  toPng: jest.fn(),
  toSvg: jest.fn(),
}));

const createInsertBuilder = (data = { id: 'diagram-1' }) => ({
  select: jest.fn(() => ({
    single: jest.fn(() => Promise.resolve({ data, error: null })),
  })),
});

const createCountBuilder = () => ({
  eq: jest.fn(() => Promise.resolve({ count: 0, error: null })),
});

describe('DiagramGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSessionMock.mockResolvedValue({
      data: {
        session: {
          access_token: 'token-1',
          user: { id: 'user-1', email: 'user@example.com' },
        },
      },
      error: null,
    });
    fromMock.mockImplementation((table: string) => {
      if (table === 'diagrams') {
        return {
          insert: jest.fn(() => createInsertBuilder()),
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        };
      }

      if (table === 'document_versions') {
        return {
          select: jest.fn(() => createCountBuilder()),
          insert: jest.fn(() => Promise.resolve({ error: null })),
        };
      }

      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        insert: jest.fn(() => Promise.resolve({ error: null })),
      };
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    });
    global.fetch = jest.fn();
  });

  it('renders without crashing', () => {
    render(<DiagramGenerator />);

    expect(screen.getByText('Write Your Diagram')).toBeInTheDocument();
    expect(screen.getByTestId('diagram-preview')).toBeInTheDocument();
  });

  it('disables the Generate button when prompt is empty', () => {
    render(<DiagramGenerator />);

    expect(screen.getAllByLabelText('Generate diagram from prompt')[0]).toBeDisabled();
  });

  it('calls /api/generate/diagram on Generate click with correct payload', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: 'flowchart TD\nA-->B', title: 'Generated' }),
    });

    render(<DiagramGenerator />);

    await user.type(screen.getByLabelText('Describe Your Diagram'), 'Build a flowchart');
    await user.click(screen.getAllByLabelText('Generate diagram from prompt')[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/generate/diagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-1',
        },
        body: JSON.stringify({
          prompt: 'Build a flowchart',
          diagramType: 'flowchart',
        }),
      });
    });
  });

  it('shows loading state during API call', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => undefined));

    render(<DiagramGenerator />);

    await user.type(screen.getByLabelText('Describe Your Diagram'), 'Build a flowchart');
    await user.click(screen.getAllByLabelText('Generate diagram from prompt')[0]);

    expect(screen.getAllByText('Generating with AI...')[0]).toBeInTheDocument();
  });

  it('renders Mermaid code in textarea after successful generation', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: 'flowchart TD\nA-->B', title: 'Generated' }),
    });

    render(<DiagramGenerator />);

    await user.type(screen.getByLabelText('Describe Your Diagram'), 'Build a flowchart');
    await user.click(screen.getAllByLabelText('Generate diagram from prompt')[0]);
    await user.click(screen.getByRole('tab', { name: /code editor/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Edit Mermaid diagram code')).toHaveValue('flowchart TD\nA-->B');
    });
  });

  it('shows error toast when API returns error', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Generation failed' }),
    });

    render(<DiagramGenerator />);

    await user.type(screen.getByLabelText('Describe Your Diagram'), 'Build a flowchart');
    await user.click(screen.getAllByLabelText('Generate diagram from prompt')[0]);

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Generation Failed',
        variant: 'destructive',
      }));
    });
  });

  it('copies diagramCode to clipboard from Copy Code button', async () => {
    const user = userEvent.setup();
    const writeTextMock = jest.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });

    render(<DiagramGenerator />);

    await user.click(screen.getAllByText('Copy Code')[0]);

    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('flowchart TD'));
  });

  it('shows Save button and calls supabase insert', async () => {
    const user = userEvent.setup();
    const diagramsInsert = jest.fn(() => createInsertBuilder());
    fromMock.mockImplementation((table: string) => {
      if (table === 'diagrams') {
        return {
          insert: diagramsInsert,
          select: jest.fn(),
        };
      }

      if (table === 'document_versions') {
        return {
          select: jest.fn(() => createCountBuilder()),
          insert: jest.fn(() => Promise.resolve({ error: null })),
        };
      }

      return {};
    });

    render(<DiagramGenerator />);

    const saveButtons = screen.getAllByText('Save');
    expect(saveButtons.length).toBeGreaterThan(0);
    await user.click(saveButtons[0]);

    await waitFor(() => {
      expect(diagramsInsert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 'user-1',
        title: 'Untitled Diagram',
        type: 'flowchart',
        prompt: '',
      }));
    });
  });
});
