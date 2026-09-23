import React, { useEffect, useState } from 'react';

const statusOptions = [
  { value: 'IN_PROGRESS', label: 'In progress', detail: 'Work is actively being handled' },
  { value: 'RESOLVED', label: 'Resolved', detail: 'The request has been completed' },
  { value: 'INVALID_STATUS', label: 'Invalid status', detail: 'Validation test: expect a rejection' },
];

const statusLabels = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
};

export function UpdateStatusForm({ ticket, onBack }) {
  const ticketId = ticket?.id || 'TCK-101';
  const [status, setStatus] = useState('IN_PROGRESS');
  const [currentStatus, setCurrentStatus] = useState('OPEN');
  const [approvalStatus, setApprovalStatus] = useState(ticket?.approvalStatus || 'NOT_REQUIRED');
  const [role, setRole] = useState('AGENT');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApprovalSubmitting, setIsApprovalSubmitting] = useState(false);

  useEffect(() => {
    setCurrentStatus(ticket?.status || 'OPEN');
    setStatus(ticket?.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED');
    setApprovalStatus(ticket?.approvalStatus || 'NOT_REQUIRED');
  }, [ticket]);

  const handleApproval = async (action) => {
    setResponse(null);
    setError(null);
    setIsApprovalSubmitting(true);

    try {
      const res = await fetch(`http://localhost:3000/tickets/${ticketId}/approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': role,
          'x-user-id': 'agent-001',
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(message || 'The approval decision could not be saved.');
      }
      setApprovalStatus(data.approvalStatus);
      setResponse(`Ticket ${data.id} marked ${data.approvalStatus === 'APPROVED' ? 'approved' : 'rejected'}.`);
    } catch (approvalError) {
      setError(approvalError.message);
    } finally {
      setIsApprovalSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`http://localhost:3000/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': role, // Triggers our authorization rule
          'x-user-id': 'agent-001',
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(message || `Error ${res.status}: Request failed`);
      }

      setCurrentStatus(data.status);
      setResponse(`Success: Ticket ${data.id} status updated to "${data.status}"`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStatus = statusOptions.find((option) => option.value === status);
  const currentStatusLabel = statusLabels[currentStatus] || currentStatus;
  const transitionHint = currentStatus === 'OPEN'
    ? 'Move the ticket to In progress before resolving it.'
    : currentStatus === 'IN_PROGRESS'
      ? 'This ticket is ready to be resolved.'
      : 'This ticket is complete and cannot be changed.';

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">OS</div>
          <div>
            <span className="eyebrow">Operations Service Hub</span>
            <strong>Service desk</strong>
          </div>
        </div>
        <div className="environment"><span className="status-dot" /> Local environment</div>
      </header>

      <section className="page-heading">
        <div>
          <span className="eyebrow">Ticket operations / Status change</span>
          <h1>Update ticket status</h1>
          <p>Move work forward with a controlled status change.</p>
        </div>
        <button type="button" className="back-button" onClick={onBack}>&lt;- Back to ticket queue</button>
      </section>

      <div className="workspace-grid">
        <aside className="ticket-card">
          <div className="card-kicker">Ticket overview</div>
          <div className="ticket-id">{ticketId}</div>
          <h2>{ticket?.title || 'System access issue'}</h2>
          <p className="muted">{ticket?.summary || 'Standard service request awaiting an operational update.'}</p>
          <div className="divider" />
          <div className="meta-row"><span>Current status</span><span className="status-pill status-pill--open"><span /> {currentStatusLabel}</span></div>
          <div className="meta-row"><span>Priority</span><strong>{ticket?.priority || 'Normal'}</strong></div>
          <div className="meta-row"><span>Category</span><strong>{ticket?.category || 'IT'}</strong></div>
          {approvalStatus !== 'NOT_REQUIRED' && <div className="meta-row"><span>Approval</span><strong className={`approval-detail approval-detail--${approvalStatus.toLowerCase()}`}>{approvalStatus === 'PENDING' ? 'Pending' : approvalStatus === 'APPROVED' ? 'Approved' : 'Rejected'}</strong></div>}
          {ticket?.classificationSignals?.length > 0 && <div className="ticket-evidence"><span>Intake evidence</span><div>{ticket.classificationSignals.map((signal) => <span className="signal-chip" key={signal}>{signal}</span>)}</div></div>}
          <div className="timeline">
            <div className={`timeline-item ${currentStatus === 'OPEN' ? 'timeline-item--active' : ''}`}><span className="timeline-marker" /><div><strong>Open</strong><small>Ticket created</small></div></div>
            <div className={`timeline-item ${currentStatus === 'IN_PROGRESS' ? 'timeline-item--active' : ''}`}><span className="timeline-marker" /><div><strong>In progress</strong><small>Work is actively being handled</small></div></div>
            <div className={`timeline-item ${currentStatus === 'RESOLVED' ? 'timeline-item--active' : ''}`}><span className="timeline-marker" /><div><strong>Resolved</strong><small>Request completed</small></div></div>
          </div>
        </aside>

        <section className="form-card">
          <div className="form-card-header"><div><span className="card-kicker">Change request</span><h2>Set a new status</h2></div><span className="request-method">PATCH</span></div>
          {approvalStatus === 'PENDING' && <div className="approval-card"><div><span className="card-kicker">Decision required</span><strong>Manager approval is needed before work can begin.</strong><span>{ticket?.approvalReason || 'Review the request and choose an approval decision.'}</span></div><div className="approval-actions"><button type="button" className="approve-button" disabled={isApprovalSubmitting} onClick={() => handleApproval('APPROVE')}>{isApprovalSubmitting ? 'Saving...' : 'Approve request'}</button><button type="button" className="reject-button" disabled={isApprovalSubmitting} onClick={() => handleApproval('REJECT')}>Reject request</button></div></div>}
          {approvalStatus === 'NOT_REQUIRED' && currentStatus === 'OPEN' && <div className="approval-card approval-card--review"><div><span className="card-kicker">Request decision</span><strong>Review this submitted request before work begins.</strong><span>Reject it if the request is invalid, duplicated, or outside the service scope.</span></div><div className="approval-actions"><button type="button" className="reject-button" disabled={isApprovalSubmitting} onClick={() => handleApproval('REJECT')}>Reject request</button></div></div>}
          {approvalStatus === 'REJECTED' && <div className="approval-card approval-card--rejected"><span className="card-kicker">Request rejected</span><strong>This ticket cannot be started or resolved.</strong><span>The request remains recorded for audit purposes.</span></div>}
          {approvalStatus !== 'PENDING' && approvalStatus !== 'REJECTED' && <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="role">Acting role</label>
              <span className="field-help">Controls authorization for this request.</span>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="AGENT">Agent - permitted</option>
                <option value="REQUESTER">Requester - restricted</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="status">New ticket status</label>
              <span className="field-help">Choose the next state for {ticketId}.</span>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <div className="selection-note"><span className="selection-icon">i</span><span>{selectedStatus.detail}</span></div>
              <div className="selection-note"><span className="selection-icon">-&gt;</span><span>{transitionHint}</span></div>
            </div>
            <button type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Updating ticket...' : 'Update ticket status'}</span>
              {!isSubmitting && <span className="button-arrow">-&gt;</span>}
            </button>
          </form>}

          {ticket?.classificationReasons?.length > 0 && <div className="ticket-reasoning"><span className="card-kicker">Routing context</span><strong>Why this ticket was routed</strong><ul>{ticket.classificationReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>}

          {response && <div className="feedback feedback--success" role="status"><span className="feedback-icon">OK</span><div><strong>Status updated</strong><span>{response}</span></div></div>}
          {error && <div className="feedback feedback--error" role="alert"><span className="feedback-icon">!</span><div><strong>Update failed</strong><span>{error}</span></div></div>}
        </section>
      </div>
      <footer className="page-footer"><span>Operations Service Hub</span><span>API endpoint: localhost:3000</span></footer>
    </main>
  );
}