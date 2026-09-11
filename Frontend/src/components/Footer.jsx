function Footer() {
  return (
    <footer className="footer">

      <div className="container footer-container">

        <div>
          <strong className="footer-logo">
            SV
          </strong>

          <p>
            Creative Designer & Web Developer
          </p>
        </div>

        <div className="footer-links">

          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>

        </div>

        <p className="footer-copy">
          © {new Date().getFullYear()} All rights reserved.
        </p>

      </div>

    </footer>
  );
}

export default Footer;