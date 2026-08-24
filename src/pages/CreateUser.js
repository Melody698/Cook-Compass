import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Grid, Paper } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

function CreateUser() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData.name || !userData.email || !userData.password || !userData.confirmPassword) {
      alert('All fields are required!');
      return;
    }

    if (userData.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.name,
          email: userData.email,
          password: userData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || 'Something went wrong');
        return;
      }

      alert('User created successfully! You can now log in.');
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div>
      <Box sx={{ marginTop: '80px', padding: '20px' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Create User Profile
        </Typography>

        <Paper elevation={3} sx={{ padding: '30px', marginBottom: '30px' }}>
          <Box sx={{ textAlign: 'center', marginBottom: '20px' }}>
            <AccountCircleIcon sx={{ fontSize: 100, color: '#3f51b5' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              Create Your Account
            </Typography>
          </Box>

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
                  onChange={handleChange}
                  type="email"
                  sx={{ backgroundColor: '#fff', borderRadius: '8px' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password"
                  variant="outlined"
                  fullWidth
                  value={userData.password}
                  name="password"
                  onChange={handleChange}
                  type="password"
                  sx={{ backgroundColor: '#fff', borderRadius: '8px' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Confirm Password"
                  variant="outlined"
                  fullWidth
                  value={userData.confirmPassword}
                  name="confirmPassword"
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
                    Create Account
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </div>
  );
}

export default CreateUser;