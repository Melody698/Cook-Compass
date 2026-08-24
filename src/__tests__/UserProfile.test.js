import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserProfile from '../pages/UserProfile'; // Adjust path if needed
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('UserProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    sessionStorage.setItem('userId', '123');
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>
    );
  };

  test('renders UserProfile component correctly', async () => {
    window.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            user: { username: 'John Doe', email: 'john@example.com' },
          }),
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });
  });

  test('shows alert when name is empty on update', async () => {
    window.alert = jest.fn();

    window.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            user: { username: '', email: 'john@example.com' },
          }),
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText('Full Name')).toHaveValue('');
    });

    fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    expect(window.alert).toHaveBeenCalledWith('Name cannot be empty');
  });

  test('successful profile update', async () => {
    window.alert = jest.fn();

    window.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              user: { username: 'John Doe', email: 'john@example.com' },
            }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({}),
        })
      );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Updated Name' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Profile updated successfully');
    });
  });

  test('successful account deletion', async () => {
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);

    window.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              user: { username: 'John Doe', email: 'john@example.com' },
            }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({}),
        })
      );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Account deleted successfully');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
