import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  test('renders Login component correctly', () => {
    renderComponent();

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Profile/i })).toBeInTheDocument();
  });

  test('shows error if fields are empty', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    expect(screen.getByText('Both email and password are required.')).toBeInTheDocument();
  });

  test('successful login', async () => {
    renderComponent();

    window.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          user: {
            id: '123',
            username: 'JohnDoe',
            email: 'john@example.com',
          },
        }),
      })
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(sessionStorage.getItem('userId')).toBe('123');
    });

    await waitFor(() => {
      expect(sessionStorage.getItem('userName')).toBe('JohnDoe');
    });

    await waitFor(() => {
      expect(sessionStorage.getItem('userEmail')).toBe('john@example.com');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home', {
        state: {
          user: {
            id: '123',
            username: 'JohnDoe',
            email: 'john@example.com',
          },
        },
      });
    });
  });

  test('failed login', async () => {
    renderComponent();

    window.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      })
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('navigates to Create User page', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Create Profile/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/create-user');
  });
});
