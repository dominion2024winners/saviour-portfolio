function About() {
  return (
    <section id="about" className="section about-section">
      <div className="container">

        <div className="section-header">
          <span className="section-label">ABOUT ME</span>

          <h2 className="section-title">
            Turning ideas into
            <span> meaningful digital work.</span>
          </h2>

          <p className="section-description">
            I'm a creative professional passionate about design,
            technology and building digital experiences that solve
            real problems.
          </p>
        </div>

        <div className="about-content">

          <div className="about-text">
            <p>
              My work combines creativity, design thinking and
              technology to help businesses and individuals
              communicate their ideas effectively.
            </p>

            <p>
              From brand identity and graphic design to modern
              web applications, I focus on creating work that
              looks professional and delivers real value.
            </p>
          </div>

          <div className="about-stats">

            <div className="about-stat">
              <strong>01</strong>
              <span>Creative Design</span>
            </div>

            <div className="about-stat">
              <strong>02</strong>
              <span>Web Development</span>
            </div>

            <div className="about-stat">
              <strong>03</strong>
              <span>Brand Identity</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default About;