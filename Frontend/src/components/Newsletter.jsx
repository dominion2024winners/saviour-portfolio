import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Subscription failed.");
      setMessage(data.message);
      setEmail("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section newsletter-section">
      <div className="container newsletter-card">
        <div>
          <span className="section-label">STAY UPDATED</span>
          <h2 className="section-title">Get useful ideas in your inbox.</h2>
          <p className="section-description">Occasional insights on design, development and digital presence.</p>
        </div>
        <form onSubmit={handleSubmit} className="newsletter-form">
          <label className="newsletter-label" htmlFor="newsletter-email">Email address</label>
          <input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" required />
          <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Joining..." : "Subscribe"}</button>
          {message && <small role="status">{message}</small>}
        </form>
      </div>
    </section>
  );
}

export default Newsletter;
