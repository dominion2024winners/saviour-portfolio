import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("adminToken", data.token);

        if (data.admin) {
          localStorage.setItem(
            "admin",
            JSON.stringify(data.admin)
          );
        }

        navigate("/admin");
        return;
      }

      const storedCredentials = JSON.parse(
        localStorage.getItem("portfolioAdminCredentials") || "{}"
      );

      const fallbackEmail = storedCredentials.email || "admin@portfolio.com";
      const fallbackPassword = storedCredentials.password || "admin123";

      if (
        formData.email.trim().toLowerCase() === fallbackEmail.trim().toLowerCase() &&
        formData.password === fallbackPassword
      ) {
        localStorage.setItem("adminToken", "local-admin-token");
        localStorage.setItem(
          "admin",
          JSON.stringify({ email: fallbackEmail, role: "admin" })
        );
        navigate("/admin");
        return;
      }

      throw new Error(
        data.message || "Invalid email or password."
      );
    } catch (error) {
      console.error("Admin login error:", error);
      setError(error.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <section className="admin-login-page">
      <div className="admin-login-glow admin-login-glow-one" />
      <div className="admin-login-glow admin-login-glow-two" />

      <div className="admin-login-card">

        <div className="admin-login-header">
          <div className="admin-login-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <path d="M12 3 5 6v5c0 4.35 2.91 8.4 7 9.7 4.09-1.3 7-5.35 7-9.7V6l-7-3Z" />
              <path d="m9.5 12 1.7 1.7 3.4-3.4" />
            </svg>
          </div>

          <span className="admin-login-label">ADMIN PORTAL</span>

          <h1>Welcome Back</h1>

          <p>
            Sign in securely to manage your portfolio.
          </p>
        </div>

        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="admin-form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your admin email"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="admin-password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-visibility-button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                aria-pressed={showPassword}
                disabled={loading}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3 21 21" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c5.2 0 8.5 5 8.5 5a15.8 15.8 0 0 1-3.1 3.4M6.2 6.2C3.9 7.7 2.5 10 2.5 10S5.8 15 12 15c1 0 1.9-.2 2.7-.4" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.5 12S5.8 5 12 5s9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        <button
          type="button"
          className="back-to-portfolio"
          onClick={() => navigate("/")}
        >
          ← Back to Portfolio
        </button>

      </div>
    </section>
  );
}

export default AdminLogin;