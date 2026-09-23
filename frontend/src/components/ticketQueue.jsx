import React, { useEffect, useState } from 'react';

const apiUrl = 'http://localhost:3000';

const statusLabels = {
  OPEN: 'Submitted',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
};

function formatCreated(date) {
  return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function TicketQueue({ onOpenTicket }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [updatingTicketId, setUpdatingTicketId] = useState('');

  const loadTickets = async () => {
    try {
      const response = await fetch(`${apiUrl}/tickets`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'The queue could not be loaded.');
      setTickets(data);
      setLastUpdated(new Date());
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    const interval = window.setInterval(loadTickets, 10000);
    return () => window.clearInterval(interval);
  }, []);

  const updateStatus = async (ticket) => {
    const nextStatus = ticket.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED';
    setUpdatingTicketId(ticket.id);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/tickets/${ticket.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'AGENT',
          'x-user-id': 'agent-001',
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'The ticket status could not be updated.');
      setTickets((currentTickets) => currentTickets.map((item) => item.id === data.id ? data : item));
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingTicketId('');
    }
  };

  const rejectTicket = async (ticket) => {
    if (!window.confirm(`Reject "${ticket.title}"? This ticket cannot be started or resolved afterward.`)) return;

    setUpdatingTicketId(ticket.id);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/tickets/${ticket.id}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'AGENT',
          'x-user-id': 'agent-001',
        },
        body: JSON.stringify({ action: 'REJECT' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'The ticket could not be rejected.');
      setTickets((currentTickets) => currentTickets.map((item) => item.id === data.id ? data : item));
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingTicketId('');
    }
  };

  const visibleTickets = categoryFilter === 'ALL'
    ? tickets
    : tickets.filter((ticket) => ticket.category === categoryFilter);

  return (
    <main className="queue-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">OS</div>
          <div><span className="eyebrow">Operations Service Hub</span><strong>Team queue</strong></div>
        </div>
        <div className="environment"><span className="status-dot" /> Live queue</div>
      </header>

      <section className="queue-heading">
        <div>
          <span className="eyebrow">Operations / Work intake</span>
          <h1>Work that needs attention.</h1>
          <p>Prioritized requests from every service channel, ready for the right team to pick up.</p>
        </div>
        <div className="queue-health"><span className="status-dot" /><strong>Live</strong><span>{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Connecting...'}</span></div>
      </section>

      <section className="queue-content" aria-live="polite">
        <div className="queue-toolbar"><div><span className="card-kicker">Live queue</span><h2>Recent requests</h2></div><div className="queue-toolbar__controls"><select className="queue-filter" aria-label="Filter requests by team" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="ALL">All requests</option><option value="IT">IT</option><option value="HR">HR</option><option value="FACILITIES">Facilities</option><option value="ACCESS">Access</option></select><span className="queue-refresh">{visibleTickets.length} shown · refreshes every 10 seconds</span></div></div>
        {error && <div className="feedback feedback--error" role="alert"><span className="feedback-icon">!</span><div><strong>Queue unavailable</strong><span>{error}</span></div></div>}
        {isLoading && <div className="queue-empty"><strong>Loading live queue...</strong><span>Connecting to the service desk.</span></div>}
        {!isLoading && !error && visibleTickets.length === 0 && <div className="queue-empty"><strong>No requests in this view</strong><span>New work will appear here when it is available.</span></div>}
        {!isLoading && visibleTickets.length > 0 && <div className="queue-table-wrap"><table className="queue-table"><thead><tr><th scope="col">Request</th><th scope="col">Team</th><th scope="col">Status</th><th scope="col">Created</th><th scope="col">Action</th></tr></thead><tbody>{visibleTickets.map((ticket) => <tr key={ticket.id}>
          <td><button type="button" className="queue-request" onClick={() => onOpenTicket(ticket)}><strong>{ticket.title}</strong><span>#{ticket.id}</span></button></td>
          <td><span className={`team-mark team-mark--${(ticket.category || 'UNASSIGNED').toLowerCase()}`}>{(ticket.category || '?').charAt(0)}</span><span className="team-name">{ticket.category || 'Unassigned'}</span></td>
          <td><span className={`table-status table-status--${ticket.approvalStatus === 'PENDING' ? 'pending' : ticket.approvalStatus === 'REJECTED' ? 'rejected' : ticket.status.toLowerCase()}`}>{ticket.approvalStatus === 'PENDING' ? 'Awaiting approval' : ticket.approvalStatus === 'REJECTED' ? 'Rejected' : statusLabels[ticket.status] || ticket.status}</span></td>
          <td className="created-date">{formatCreated(ticket.createdAt)}</td>
          <td><div className="queue-actions">{ticket.approvalStatus === 'PENDING' && <span className="completed-label">Decision needed</span>}{ticket.approvalStatus === 'REJECTED' && <span className="completed-label">Not actionable</span>}{ticket.approvalStatus !== 'PENDING' && ticket.approvalStatus !== 'REJECTED' && ticket.status !== 'RESOLVED' && <button type="button" className="row-action" disabled={updatingTicketId === ticket.id} onClick={() => updateStatus(ticket)}>{updatingTicketId === ticket.id ? 'Updating...' : ticket.status === 'OPEN' ? 'Start' : 'Resolve'}</button>}{ticket.status === 'OPEN' && ticket.approvalStatus !== 'REJECTED' && <button type="button" className="row-action row-action--reject" disabled={updatingTicketId === ticket.id} onClick={() => rejectTicket(ticket)}>Reject</button>}{ticket.status === 'RESOLVED' && <span className="completed-label">Complete</span>}<button type="button" className="row-action row-action--secondary" onClick={() => onOpenTicket(ticket)}>View</button></div></td>
        </tr>)}</tbody></table></div>}
      </section>
      <footer className="page-footer"><span>Operations Service Hub</span><span>Queue monitor / v1.0</span></footer>
    </main>
  );
}
