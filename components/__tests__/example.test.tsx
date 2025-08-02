import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { create } from 'zustand';

interface FormState {
  count: number;
  increment: () => void;
}

const useStore = create<FormState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

const ExampleForm = () => {
  const { count, increment } = useStore();
  const { register, handleSubmit } = useForm<{ input: string }>();

  const onSubmit = (data: { input: string }) => {
    console.log(data);
  };

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>Increment</button>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('input')} placeholder="Enter text" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

// Jest test suite
describe('ExampleForm Component', () => {
  it('renders correctly and displays initial count', () => {
    render(<ExampleForm />);
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('increments count when button is clicked', async () => {
    render(<ExampleForm />);
    const incrementButton = screen.getByText('Increment');
    await userEvent.click(incrementButton);
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  it('submits form with input value', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<ExampleForm />);
    const input = screen.getByPlaceholderText('Enter text');
    const submitButton = screen.getByText('Submit');

    await userEvent.type(input, 'Test input');
    await userEvent.click(submitButton);

    expect(consoleSpy).toHaveBeenCalledWith({ input: 'Test input' });
    consoleSpy.mockRestore();
  });
});