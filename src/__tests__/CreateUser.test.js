import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateUser from '../pages/CreateUser';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('CreateUser Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <CreateUser />
      </BrowserRouter>
    );
  };

  test('renders CreateUser component correctly', () => {
    renderComponent();
    expect(screen.getByText('Create User Profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  test('shows alert if fields are empty', () => {
    renderComponent();
    window.alert = jest.fn();

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(window.alert).toHaveBeenCalledWith('All fields are required!');
  });

  test('shows alert if password is too short', () => {
    renderComponent();
    window.alert = jest.fn();

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(window.alert).toHaveBeenCalledWith('Password must be at least 6 characters long!');
  });

  test('shows alert if passwords do not match', () => {
    renderComponent();
    window.alert = jest.fn();

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: '654321' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(window.alert).toHaveBeenCalledWith('Passwords do not match!');
  });

  test('successful user creation', async () => {
    renderComponent();
    window.alert = jest.fn();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'User created successfully!' }),
      })
    );

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: '123456' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('User created successfully! You can now log in.');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('failed user creation', async () => {
    renderComponent();
    window.alert = jest.fn();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'User already exists' }),
      })
    );

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: '123456' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('User already exists');
    });
  });
});
