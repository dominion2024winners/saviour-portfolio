import { useState } from "react";
import "./contact.css";
import { trackAnalyticsEvent } from "../utils/analytics";
import { useTranslation } from "../utils/i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    budget: "",
    message: "",
  });

  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================================
  // HANDLE INPUT CHANGES
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear previous message when user starts editing again
    if (status.message) {
      setStatus({
        type: "",
        message: "",
      });
    }
  };

  // =========================================================
  // SUBMIT CONTACT FORM
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);

    setStatus({
      type: "",
      message: "",
    });

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to send your project inquiry."
        );
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      setStatus({
        type: "success",
        message:
          data.message ||
          "Your project inquiry has been sent successfully.",
      });

      trackAnalyticsEvent({
        type: "contact_submit",
        path: "/#contact",
      });

      // Clear form
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        budget: "",
        message: "",
      });
    } catch (error) {
      console.error(
        "Contact form submission error:",
        error
      );

      const isNetworkFailure =
        error instanceof TypeError ||
        error?.name === "TypeError" ||
        error?.message?.toLowerCase().includes("fetch");

      setStatus({
        type: "error",
        message: isNetworkFailure
          ? "The contact form is temporarily unavailable because the server is offline. Please email hello@example.com and I’ll get back to you as soon as it’s back online."
          : error.message ||
            "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="section contact-section"
    >
      <div className="container">

        <div className="contact-container">

          {/* =================================================
              CONTACT INFORMATION
              ================================================= */}

          <div className="contact-content">

            <span className="section-label">
              CONTACT
            </span>

            <h2>
              Let's build something
              <span> great together.</span>
            </h2>

            <p>
              Have a project, business idea, or creative
              challenge? Tell me what you need and I'll get
              back to you with the next steps.
            </p>

            <a
              href="mailto:hello@example.com"
              className="contact-email"
            >
              hello@example.com
            </a>
            <div className="contact-quick-links">
              <a href="https://wa.me/15551234567" target="_blank" rel="noreferrer">              {t("whatsapp")}</a>
              <a href="https://calendly.com/" target="_blank" rel="noreferrer">              {t("bookCall")}</a>
              <a href="/resume.pdf" download>              {t("downloadCv")}</a>
            </div>

          </div>


          {/* =================================================
              CONTACT FORM
              ================================================= */}

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >

            {/* =================================================
                FORM STATUS MESSAGE
                ================================================= */}

            {status.message && (
              <div
                className={`form-message ${status.type}`}
                role="alert"
              >
                {status.message}
              </div>
            )}


            {/* =================================================
                NAME + EMAIL
                ================================================= */}

            <div className="form-row">

              <div className="form-group">

                <label htmlFor="name">
                  Your Name
                </label>

                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                />

              </div>


              <div className="form-group">

                <label htmlFor="email">
                  Your Email
                </label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />

              </div>

            </div>

            <div className="form-group">

              <label htmlFor="phone">
                Your Phone Number
              </label>

              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                autoComplete="tel"
                required
              />

            </div>


            {/* =================================================
                SERVICE + BUDGET
                ================================================= */}

            <div className="form-selection-row">

              {/* SERVICE */}

              <div className="form-group">

                <label htmlFor="service">
                  Service Needed
                </label>

                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="service-select"
                  required
                >

                  <option value="" disabled>
                    Select a service
                  </option>

                  <option value="Graphic Design">
                    Graphic Design
                  </option>

                  <option value="Branding & Visual Identity">
                    Branding & Visual Identity
                  </option>

                  <option value="Website Design & Development">
                    Website Design & Development
                  </option>

                  <option value="Frontend Development">
                    Frontend Development
                  </option>

                  <option value="Backend Development">
                    Backend Development
                  </option>

                  <option value="Full-Stack Web Development">
                    Full-Stack Web Development
                  </option>

                  <option value="Social Media Design">
                    Social Media Design
                  </option>

                  <option value="Digital Marketing">
                    Digital Marketing
                  </option>

                  <option value="Website Maintenance">
                    Website Maintenance
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

                <span className="form-helper">
                  Choose the service you are interested in.
                </span>

              </div>


              {/* BUDGET */}

              <div className="form-group">

                <label htmlFor="budget">
                  Estimated Budget
                </label>

                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="budget-select"
                  required
                >

                  <option value="" disabled>
                    Select your budget
                  </option>

                  <option value="Under ₦50,000">
                    Under ₦50,000
                  </option>

                  <option value="₦50,000 – ₦100,000">
                    ₦50,000 – ₦100,000
                  </option>

                  <option value="₦100,000 – ₦250,000">
                    ₦100,000 – ₦250,000
                  </option>

                  <option value="₦250,000 – ₦500,000">
                    ₦250,000 – ₦500,000
                  </option>

                  <option value="₦500,000 – ₦1,000,000">
                    ₦500,000 – ₦1,000,000
                  </option>

                  <option value="Above ₦1,000,000">
                    Above ₦1,000,000
                  </option>

                  <option value="I'm not sure yet">
                    I'm not sure yet
                  </option>

                </select>

                <span className="form-helper">
                  Don't worry if you're unsure. We can
                  discuss it.
                </span>

              </div>

            </div>


            {/* =================================================
                PROJECT DETAILS
                ================================================= */}

            <div className="form-group">

              <label htmlFor="message">
                Project Details
              </label>

              <textarea
                id="message"
                name="message"
                rows="6"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell me about your project, your goals, timeline, and any other important details..."
                required
              ></textarea>

            </div>


            {/* =================================================
                SUBMIT BUTTON
                ================================================= */}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Sending Inquiry..."
                : "Send Project Inquiry"}
            </button>

          </form>

        </div>

      </div>
    </section>
  );
}

export default Contact;