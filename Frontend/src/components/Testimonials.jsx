import { useEffect, useState } from "react";

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

const readAdminTestimonials = () =>
  readStorage("portfolioTestimonials", []).filter(
    (testimonial) =>
      !["testimonial-1", "testimonial-2", "testimonial-3"].includes(
        testimonial.id
      )
  );

function Testimonials() {
  const [testimonials, setTestimonials] = useState(() =>
    readAdminTestimonials()
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setTestimonials(readAdminTestimonials());
  }, []);

  return (
    <section id="testimonials" className="section testimonial-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">TESTIMONIALS</span>
          <h2 className="section-title">
            What clients <span>say.</span>
          </h2>
          <p className="section-description">
            A few words from people who have worked with the brand and the process.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="blog-empty testimonial-empty">
            No testimonials added yet.
          </div>
        ) : (
          <>
            <div className="testimonial-grid testimonial-carousel">
            {testimonials.map((testimonial, index) => (
              <article className={`testimonial-card ${index === activeIndex ? "active" : ""}`} key={testimonial.id}>
                <span className="testimonial-quote-mark">“</span>
                <div className="testimonial-rating" aria-label={`${testimonial.rating || 5} out of 5 stars`}>
                  <span aria-hidden="true">
                    {"★".repeat(Math.min(5, Math.max(1, Number(testimonial.rating) || 5)))}
                    <span className="testimonial-rating-empty">
                      {"☆".repeat(5 - Math.min(5, Math.max(1, Number(testimonial.rating) || 5)))}
                    </span>
                  </span>
                </div>
                <p>{testimonial.quote}</p>
                <div className="testimonial-person">
                  <strong>{testimonial.name}</strong>
                  <small>{testimonial.role}</small>
                </div>
              </article>
            ))}
            </div>
            <div className="testimonial-controls" aria-label="Testimonial controls">
            <button type="button" onClick={() => setActiveIndex((activeIndex - 1 + testimonials.length) % testimonials.length)}>←</button>
            <span>{activeIndex + 1} / {testimonials.length}</span>
            <button type="button" onClick={() => setActiveIndex((activeIndex + 1) % testimonials.length)}>→</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Testimonials;
