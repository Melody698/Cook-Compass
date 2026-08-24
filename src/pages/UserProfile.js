import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { TextField, Button, Typography, Box, Grid, Paper } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

function UserProfile() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserData({
            name: data.user.username,
            email: data.user.email,
            password: '',
          });
        }
      })
      .catch(err => {
        console.error('Error fetching user data:', err);
      });
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userData.name) {
      alert('Name cannot be empty');
      return;
    }

    if (userData.password && userData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    fetch(`http://localhost:5000/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userData.name,
        password: userData.password || undefined,
      }),
    })
      .then(res => res.json())
      .then(() => {
        alert('Profile updated successfully');
        setUserData(prev => ({ ...prev, password: '' }));
      })
      .catch(err => {
        console.error('Error updating profile:', err);
        alert('Failed to update profile');
      });
  };

  const handleDeleteAccount = () => {
    if (!window.confirm('Are you sure you want to delete your account?')) return;

    fetch(`http://localhost:5000/api/users/${userId}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(() => {
        alert('Account deleted successfully');
        sessionStorage.clear();
        navigate('/');
      })
      .catch(err => {
        console.error('Error deleting account:', err);
        alert('Failed to delete account');
      });
  };

  return (
    <div>
      <NavBar />
      <Box sx={{ marginTop: '80px', padding: '20px' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          User Profile
        </Typography>

        <Paper elevation={3} sx={{ padding: '30px', display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <AccountCircleIcon sx={{ fontSize: 100, marginRight: '30px', color: '#3f51b5' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {userData.name || "Loading..."}
            </Typography>
            <Typography variant="body1" sx={{ color: 'gray' }}>
              {userData.email || "Loading..."}
            </Typography>
          </Box>
        </Paper>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                value={userData.name}
                name="name"
                onChange={handleChange}
                sx={{ backgroundColor: '#fff', borderRadius: '8px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={userData.email}
                name="email"
                disabled
                sx={{ backgroundColor: '#f5f5f5' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="New Password"
                variant="outlined"
                fullWidth
                value={userData.password}
                name="password"
                onChange={handleChange}
                type="password"
                sx={{ backgroundColor: '#fff', borderRadius: '8px' }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    padding: '12px 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#1976d2',
                    },
                  }}
                >
                  Update Profile
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  color="error"
                  sx={{
                    padding: '12px 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#d32f2f',
                    },
                  }}
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </div>
  );
}

export default UserProfile;