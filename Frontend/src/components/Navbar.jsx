import { useState } from "react";
import { useTranslation } from "../utils/i18n";

const readBrandName = () => {
  try {
    const storedSettings = localStorage.getItem("portfolioSiteSettings");

    if (!storedSettings) {
      return "Saviour Nkantion";
    }

    const parsed = JSON.parse(storedSettings);
    const brandName = parsed?.brandName || "Saviour Nkantion";

    return brandName === "Your Name" ? "Saviour Nkantion" : brandName;
  } catch (error) {
    return "Saviour Nkantion";
  }
};

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("portfolioTheme") || "light"
  );
  const { language, setLanguage, t } = useTranslation();
  const brandName = readBrandName();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("portfolioTheme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">

        <div className="navbar-brand-wrap">
          <a href="#home" className="navbar-logo" aria-label="Go to home">
            <span>SN</span>
          </a>

          <span className="navbar-name">{brandName}</span>
        </div>

        <nav className={`navbar-nav ${menuOpen ? "open" : ""}`}>
          <a href="#home" onClick={closeMenu}>
            {t("home")}
          </a>

          <a href="#about" onClick={closeMenu}>
            {t("about")}
          </a>

          <a href="#skills" onClick={closeMenu}>
            {t("skills")}
          </a>

          <a href="#projects" onClick={closeMenu}>
            {t("projects")}
          </a>

          <a href="#services" onClick={closeMenu}>
            {t("services")}
          </a>

          <a href="#contact" onClick={closeMenu}>
            {t("contact")}
          </a>
        </nav>

        <a href="#contact" className="navbar-button">
          {t("letsTalk")}
        </a>

        <label className="language-switcher">
          <span className="sr-only">{t("language")}</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label={t("language")}>
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="es">ES</option>
          </select>
        </label>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>

        <button
          className={`navbar-toggle ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>
    </header>
  );
}

export default Navbar;