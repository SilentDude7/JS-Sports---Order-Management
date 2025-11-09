import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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

const DeliveryLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validate()) {
      return; // Stop submission if validation fails
    }

    // Fake success for frontend testing
    alert('Form submitted successfully!');
    // navigate('/deliver-ui'); // Uncomment if backend is connected
  };

  return (
    <Container>
      <Card>
        <Header>
          <Logo src="/delivery-logo.png" alt="Delivery Partner" data-testid="logo" />
          <Title>Delivery Partner Login</Title>
          <Subtitle>Enter your registered email and password</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              name="email"
              data-testid="email-input"
              value={credentials.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              autoFocus
            />
            {isSubmitted && errors.email && (
              <ErrorMessage data-testid="email-error">{errors.email}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              data-testid="password-input"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
            />
            {isSubmitted && errors.password && (
              <ErrorMessage data-testid="password-error">{errors.password}</ErrorMessage>
            )}
          </FormGroup>

          <Button type="submit" data-testid="submit-btn">
            Submit
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default DeliveryLogin;
