import { useEffect, useState } from "react";
import "./Services.css";

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

function Services() {
  const [services, setServices] = useState(() =>
    readStorage("portfolioServices", [
      {
        id: "svc-1",
        title: "Graphic Design",
        description:
          "Professional graphics designed for businesses, brands and digital platforms.",
      },
      {
        id: "svc-2",
        title: "Brand Identity",
        description:
          "Complete visual identities that give brands a strong and consistent presence.",
      },
      {
        id: "svc-3",
        title: "Web Development",
        description:
          "Modern responsive websites and web applications built with current technologies.",
      },
    ])
  );

  useEffect(() => {
    setServices(
      readStorage("portfolioServices", [
        {
          id: "svc-1",
          title: "Graphic Design",
          description:
            "Professional graphics designed for businesses, brands and digital platforms.",
        },
        {
          id: "svc-2",
          title: "Brand Identity",
          description:
            "Complete visual identities that give brands a strong and consistent presence.",
        },
        {
          id: "svc-3",
          title: "Web Development",
          description:
            "Modern responsive websites and web applications built with current technologies.",
        },
      ])
    );
  }, []);

  return (
    <section id="services" className="section services-section">
      <div className="container">

        <div className="section-header">
          <span className="section-label">SERVICES</span>

          <h2 className="section-title">
            What I can
            <span> do for you.</span>
          </h2>
        </div>

        <div className="services-grid">

          {services.map((service, index) => (
            <article className="service-card" key={service.id || `${service.title}-${index}`}>

              <span className="service-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3>{service.title}</h3>

              <p>{service.description}</p>

            </article>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Services;