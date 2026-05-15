import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Add Razorpay script to window
const script = document.createElement('script');
script.src = 'https://checkout.razorpay.com/v1/checkout.js';
script.async = true;
document.body.appendChild(script);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
