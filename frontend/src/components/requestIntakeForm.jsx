import React, { useState } from 'react';

const categories = [
  { value: '', label: 'Let the assistant suggest' },
  { value: 'IT', label: 'IT and equipment' },
  { value: 'HR', label: 'People and HR' },
  { value: 'FACILITIES', label: 'Facilities' },
  { value: 'ACCESS', label: 'Access and permissions' },
];

const apiUrl = 'http://localhost:3000';

export function RequestIntakeForm() {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResult(null);
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/request-intake/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, ...(category ? { category } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) {
        const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(message || 'The request could not be classified.');
      }
      setResult(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="intake-shell">
      <header className="topbar intake-topbar">
        <div className="brand-lockup">
          <div className="brand-mark">OS</div>
          <div><span className="eyebrow">Operations Service Hub</span><strong>Request desk</strong></div>
        </div>
        <div className="environment"><span className="status-dot" /> Advisory intake</div>
      </header>

      <section className="intake-heading">
        <div>
          <span className="eyebrow">New request / Guided intake</span>
          <h1>Tell us what needs to happen.</h1>
          <p>Describe the work in your own words. The assistant will prepare a structured suggestion for a person to review.</p>
        </div>
        <div className="authority-note"><span className="authority-icon">i</span><span>AI is advisory. Your operations team has final authority.</span></div>
      </section>

      <div className="intake-grid">
        <section className="intake-form-card">
          <div className="card-kicker">Request details</div>
          <h2>Start with the outcome</h2>
          <p className="form-intro">Include the system, item, timing, or impact when you know it. You can add the rest later.</p>
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="request-text">What do you need help with?</label>
              <textarea id="request-text" value={text} onChange={(event) => setText(event.target.value)} minLength="10" maxLength="2000" required placeholder="Example: I need a laptop for a new starter joining the design team next Monday." />
              <span className="field-help">{text.length}/2000 characters</span>
            </div>
            <div className="field-group">
              <label htmlFor="request-category">Known category <span className="optional">Optional</span></label>
              <select id="request-category" value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <button type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Preparing suggestion...' : 'Prepare request suggestion'}</span>
              {!isSubmitting && <span className="button-arrow">-&gt;</span>}
            </button>
          </form>
          {error && <div className="feedback feedback--error" role="alert"><span className="feedback-icon">!</span><div><strong>Could not prepare request</strong><span>{error}</span></div></div>}
        </section>

        <aside className="result-panel" aria-live="polite">
          {!result && !error && <div className="empty-result"><div className="empty-mark">+</div><h2>Your prepared request appears here</h2><p>Review the suggested category, urgency, and approval path before submitting it to the service team.</p></div>}
          {result && <>
            <div className="result-header"><div><span className="card-kicker">Prepared suggestion</span><h2>{result.candidate.title}</h2></div><span className="confidence">{Math.round(result.candidate.confidence * 100)}% match</span></div>
            <p className="result-summary">{result.candidate.summary}</p>
            <div className="result-facts"><div><span>Category</span><strong>{result.candidate.category}</strong></div><div><span>Priority</span><strong className={result.candidate.priority === 'HIGH' ? 'priority-high' : ''}>{result.candidate.priority}</strong></div><div><span>Approval</span><strong>{result.candidate.needsApproval ? 'Review needed' : 'Not indicated'}</strong></div></div>
            {result.candidate.approvalReason && <div className="result-callout"><strong>Approval path</strong><span>{result.candidate.approvalReason}</span></div>}
            {result.candidate.missingInformation.length > 0 && <div className="missing-info"><strong>Helpful before routing</strong><ul>{result.candidate.missingInformation.map((item) => <li key={item}>{item}</li>)}</ul></div>}
            <div className="advisory-copy">{result.advisory}</div>
          </>}
        </aside>
      </div>
      <footer className="page-footer"><span>Operations Service Hub</span><span>Request intake / v0.4</span></footer>
    </main>
  );
}