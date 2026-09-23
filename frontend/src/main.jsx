import React from 'react';
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { RequestIntakeForm } from './components/requestIntakeForm';
import { UpdateStatusForm } from './components/updateStatusForm';
import './styles.css';

function App() {
  const [view, setView] = useState('intake');

  return (
    <div className="app-router">
      <nav className="app-nav" aria-label="Operations workflows">
        <span className="app-nav__label">Operations Service Hub</span>
        <div className="app-nav__tabs">
          <button type="button" className={view === 'intake' ? 'app-nav__tab app-nav__tab--active' : 'app-nav__tab'} onClick={() => setView('intake')} aria-pressed={view === 'intake'}>Request intake</button>
          <button type="button" className={view === 'status' ? 'app-nav__tab app-nav__tab--active' : 'app-nav__tab'} onClick={() => setView('status')} aria-pressed={view === 'status'}>Ticket status</button>
        </div>
      </nav>
      {view === 'intake' ? <RequestIntakeForm /> : <UpdateStatusForm />}
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
