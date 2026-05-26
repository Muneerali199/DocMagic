import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toPng } from 'html-to-image';
import { fabric } from 'fabric';
import { EnhancedEditorToolbar } from './enhanced-toolbar';

const toastMock = jest.fn();
const addMock = jest.fn();
const setActiveObjectMock = jest.fn();
const renderAllMock = jest.fn();

const canvasMock = {
  getWidth: jest.fn(() => 1000),
  getHeight: jest.fn(() => 800),
  getZoom: jest.fn(() => 1),
  add: addMock,
  setActiveObject: setActiveObjectMock,
  renderAll: renderAllMock,
  getActiveObject: jest.fn(() => null),
};

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

jest.mock('@/lib/editor-store', () => ({
  useEditorStore: () => ({
    canvas: canvasMock,
    activeTool: 'select',
    setActiveTool: jest.fn(),
    activeShape: null,
    setActiveShape: jest.fn(),
    zoom: 1,
    setZoom: jest.fn(),
    showGrid: false,
    toggleGrid: jest.fn(),
    showGuides: false,
    toggleGuides: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    copy: jest.fn(),
    paste: jest.fn(),
    cut: jest.fn(),
    history: [],
    historyIndex: 0,
  }),
}));

jest.mock('@/components/diagram/diagram-generator', () => ({
  DiagramGenerator: () => <div id="mermaid-diagram">Rendered diagram</div>,
}));

jest.mock('html-to-image', () => ({
  toPng: jest.fn(() => Promise.resolve('data:image/png;base64,diagram')),
}));

jest.mock('fabric', () => ({
  fabric: {
    Image: {
      fromURL: jest.fn((_: string, callback: (img: any) => void) => {
        callback({
          width: 500,
          height: 300,
          set: jest.fn(),
        });
      }),
    },
  },
}));

describe('EnhancedEditorToolbar diagram insertion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Insert Diagram button with correct aria-label', () => {
    render(<EnhancedEditorToolbar />);

    expect(screen.getByLabelText('Insert diagram')).toBeInTheDocument();
  });

  it('opens the dialog when Insert Diagram button is clicked', async () => {
    const user = userEvent.setup();
    render(<EnhancedEditorToolbar />);

    await user.click(screen.getByLabelText('Insert diagram'));

    expect(screen.getByRole('heading', { name: 'Insert Diagram' })).toBeInTheDocument();
  });

  it('closes the dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<EnhancedEditorToolbar />);

    await user.click(screen.getByLabelText('Insert diagram'));
    await user.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Generate or edit a diagram, then insert the rendered preview into the canvas.')).not.toBeInTheDocument();
    });
  });

  it('calls toPng and adds image to Fabric canvas when confirmed', async () => {
    const user = userEvent.setup();
    render(<EnhancedEditorToolbar />);

    await user.click(screen.getByLabelText('Insert diagram'));
    await user.click(screen.getByRole('button', { name: 'Insert Diagram' }));

    await waitFor(() => {
      expect(toPng).toHaveBeenCalled();
      expect(fabric.Image.fromURL).toHaveBeenCalledWith(
        'data:image/png;base64,diagram',
        expect.any(Function),
      );
      expect(addMock).toHaveBeenCalled();
      expect(setActiveObjectMock).toHaveBeenCalled();
      expect(renderAllMock).toHaveBeenCalled();
    });
  });
});
