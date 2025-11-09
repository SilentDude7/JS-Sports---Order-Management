import React, { useState } from 'react';

const DeliveryPersonRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    vehicleType: 'bike',
    licenseNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would typically send the data to your backend API
      console.log('Form submitted:', formData);
      setSuccessMessage('Delivery person registered successfully!');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        vehicleType: 'bike',
        licenseNumber: '',
        password: '',
        confirmPassword: ''
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register New Delivery Person</h2>
      
      {successMessage && (
        <div style={styles.successMessage}>
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.firstName && <span style={styles.error}>{errors.firstName}</span>}
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.lastName && <span style={styles.error}>{errors.lastName}</span>}
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.email && <span style={styles.error}>{errors.email}</span>}
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Phone Number:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.phone && <span style={styles.error}>{errors.phone}</span>}
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Vehicle Type:</label>
          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="bike">Bike</option>
            <option value="scooter">Scooter</option>
            <option value="car">Car</option>
            <option value="walking">Walking</option>
          </select>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>License Number:</label>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.licenseNumber && <span style={styles.error}>{errors.licenseNumber}</span>}
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.password && <span style={styles.error}>{errors.password}</span>}
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
        </div>
        
        <button type="submit" style={styles.submitButton}>Register Delivery Person</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontWeight: 'bold',
    color: '#555'
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px'
  },
  select: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
    backgroundColor: 'white'
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginTop: '5px'
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#45a049'
    }
  },
  successMessage: {
    backgroundColor: '#dff0d8',
    color: '#3c763d',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    textAlign: 'center'
  }
};

export default DeliveryPersonRegistration;