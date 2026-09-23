import React from 'react';
import { createRoot } from 'react-dom/client';
import { UpdateStatusForm } from './components/updateStatusForm';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UpdateStatusForm />
  </React.StrictMode>,
);
