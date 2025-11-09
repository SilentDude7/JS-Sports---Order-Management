import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Logo = styled.img`
  height: 60px;
  margin-bottom: 15px;
`;

const Title = styled.h2`
  color: #333;
  margin: 10px 0;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #444;
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #00a82d;
  }
`;

const FormOptions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RememberMe = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const ForgotPassword = styled.a`
  color: #0066cc;
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Button = styled.button`
  background-color: #00a82d;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #008f26;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  background-color: #fde8e8;
  padding: 12px;
  border-radius: 4px;
  text-align: center;
`;

const Footer = styled.div`
  margin-top: 30px;
  text-align: center;
  color: #666;
  font-size: 14px;
`;

const SupportContact = styled.p`
  margin-top: 15px;
  font-size: 13px;
`;

const DeliveryLogin = () => {
  const [credentials, setCredentials] = useState({ 
    email: '',  // Changed from username to email
    password: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/api/delivery/login', {
        email: credentials.email,  // Changed to match backend expectation
        password: credentials.password
      });

      // Store token and user data
      localStorage.setItem('deliveryToken', response.data.token);
      localStorage.setItem('deliveryPerson', JSON.stringify({
        id: response.data.person.id,
        firstName: response.data.person.firstName,
        lastName: response.data.person.lastName,
        vehicleType: response.data.person.vehicleType
      }));

      // Redirect to delivery dashboard
      navigate('/deliver-ui', { state: { 
  email: credentials.email,
  firstName: response.data.person.firstName,
  lastName: response.data.person.lastName,
  vehicleType: response.data.person.vehicleType
}});

    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Header>
          <Logo src="/delivery-logo.png" alt="Delivery Partner" />
          <Title>Delivery Partner Login</Title>
          <Subtitle>Enter your registered email and password</Subtitle> {/* Updated text */}
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email Address</Label> {/* Changed from Delivery Code */}
            <Input
              type="email"  // Changed to email type
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              placeholder="Enter your registered email"
              required
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </FormGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Login'}
          </Button>
        </Form>

        <Footer>
          <p>Having trouble? Contact support at <strong>delivery-support@example.com</strong></p>
          <SupportContact>
            New delivery partner? <a href="/delivery/register">Register here</a>
          </SupportContact>
        </Footer>
      </Card>
    </Container>
  );
};

export default DeliveryLogin;
