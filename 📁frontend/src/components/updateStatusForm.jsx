import React, { useState } from 'react';

export function UpdateStatusForm({ ticketId = 'TCK-101' }) {
  const [status, setStatus] = useState('IN_PROGRESS');
  const [role, setRole] = useState('AGENT');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse(null);
    setError(null);

    try {
      const res = await fetch(`http://localhost:3000/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': role, // Triggers our authorization rule
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}: Request failed`);
      }

      setResponse(`Success: Ticket ${data.id} status updated to "${data.status}"`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '450px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Update Ticket Status</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label><strong>1. User Role (Authorization Test):</strong></label><br />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="AGENT">AGENT (Allowed)</option>
            <option value="REQUESTER">REQUESTER (Denied - 403 Forbidden)</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label><strong>2. Target Status (Validation Test):</strong></label><br />
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="INVALID_STATUS">INVALID_STATUS (Rejected - 400 Bad Request)</option>
          </select>
        </div>

        <button type="submit" style={{ padding: '10px 16px', cursor: 'pointer' }}>
          Submit Request
        </button>
      </form>

      {response && (
        <div style={{ marginTop: '16px', padding: '10px', backgroundColor: '#e6fffa', color: '#234e52' }}>
          {response}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '16px', padding: '10px', backgroundColor: '#fff5f5', color: '#9b2c2c' }}>
          <strong>Failed:</strong> {error}
        </div>
      )}
    </div>
  );
}