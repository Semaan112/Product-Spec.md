import React from 'react';
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { RequestIntakeForm } from './components/requestIntakeForm';
import { TicketQueue } from './components/ticketQueue';
import { UpdateStatusForm } from './components/updateStatusForm';
import './styles.css';

function App() {
  const [view, setView] = useState('queue');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const openTicket = (ticket) => {
    setSelectedTicket(ticket);
    setView('status');
  };

  return (
    <div className="app-router">
      <nav className="app-nav" aria-label="Operations workflows">
        <span className="app-nav__label">Operations Service Hub</span>
        <div className="app-nav__tabs">
          <button type="button" className={view === 'intake' ? 'app-nav__tab app-nav__tab--active' : 'app-nav__tab'} onClick={() => setView('intake')} aria-pressed={view === 'intake'}>Request intake</button>
          <button type="button" className={view === 'queue' || view === 'status' ? 'app-nav__tab app-nav__tab--active' : 'app-nav__tab'} onClick={() => setView('queue')} aria-pressed={view === 'queue' || view === 'status'}>Ticket queue</button>
        </div>
      </nav>
      {view === 'queue' && <TicketQueue onOpenTicket={openTicket} />}
      {view === 'intake' && <RequestIntakeForm onTicketCreated={(ticket) => { setSelectedTicket(ticket); setView('queue'); }} />}
      {view === 'status' && <UpdateStatusForm ticket={selectedTicket} onBack={() => setView('queue')} />}
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
