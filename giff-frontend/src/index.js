import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = document.getElementById('root');

const GOOGLE_CLIENT_ID =
    '780954759358-cqnev3bau95uvbk80jltofofr4qc4m38.apps.googleusercontent.com';

ReactDOM.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
  root
);