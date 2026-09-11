import { useEffect, useState } from "react";
import "./Hero.css";
import { useTranslation } from "../utils/i18n";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : fallback;

    if (typeof parsed === "object" && parsed !== null) {
      return {
        ...fallback,
        ...parsed,
        brandName:
          parsed.brandName === "Your Name"
            ? "Saviour Nkantion"
            : parsed.brandName || fallback.brandName,
        name:
          parsed.name === "Your Name"
            ? "Saviour Nkantion"
            : parsed.name || fallback.name,
        title:
          parsed.title === "Graphic Designer & Developer"
            ? "Graphic Designer & Developer"
            : parsed.title || fallback.title,
      };
    }

    return parsed;
  } catch (error) {
    return fallback;
  }
};

function Hero() {
  const { t } = useTranslation();
  const [profileImage, setProfileImage] =
    useState("");

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [siteSettings, setSiteSettings] = useState(() =>
    readStorage("portfolioSiteSettings", {
      brandName: "Saviour Nkantion",
      title: "Graphic Designer & Developer",
      heroTitle: "I create digital experiences that stand out.",
      heroDescription:
        "I design and build modern websites, visual identities, digital experiences and creative solutions for brands, businesses and individuals.",
    })
  );

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/profile`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load profile."
          );
        }

        setProfileImage(
          data.profile?.profileImage || ""
        );
      } catch (error) {
        console.error(
          "Hero profile error:",
          error
        );

        const image = readStorage("portfolioProfileImage", "");

        setProfileImage(image || "");
      } finally {
        setProfileLoading(false);
      }
    };

    const storedSettings = readStorage("portfolioSiteSettings", {
      brandName: "Saviour Nkantion",
      title: "Graphic Designer & Developer",
      heroTitle: "I create digital experiences that stand out.",
      heroDescription:
        "I design and build modern websites, visual identities, digital experiences and creative solutions for brands, businesses and individuals.",
    });

    setSiteSettings(storedSettings);
    fetch(`${API_URL}/api/settings`)
      .then((response) => response.json())
      .then((data) => {
        if (data.settings) {
          setSiteSettings((current) => ({
            ...current,
            ...data.settings,
          }));
        }
      })
      .catch((error) => {
        console.warn("Unable to load website settings.", error);
      });
    loadProfile();
  }, []);

  return (
    <section
      id="home"
      className="hero-section"
    >
      <div className="container hero-container">

        <div className="hero-content">

          <span className="hero-label">
            {siteSettings.title?.toUpperCase() || "GRAPHIC DESIGNER & DEVELOPER"}
          </span>

          <h1>
            {siteSettings.heroTitle || "I create digital experiences that stand out."}
          </h1>

          <p>
            {siteSettings.heroDescription ||
              "I design and build modern websites, visual identities, digital experiences and creative solutions for brands, businesses and individuals."}
          </p>

          <div className="hero-actions">

            <a
              href="#projects"
              className="btn btn-primary"
            >
              {t("viewWork")}
            </a>

            <a
              href="#contact"
              className="btn btn-secondary"
            >
              {t("workTogether")}
            </a>

          </div>

        </div>

        <div className="hero-visual">

          <div className="hero-profile-card">

            {profileLoading ? (
              <div className="hero-profile-placeholder">
                <span>
                  Loading...
                </span>
              </div>
            ) : profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="hero-profile-image"
              />
            ) : (
              <div className="hero-profile-placeholder">
                <span>
                  Your Photo
                </span>
              </div>
            )}

            <div className="hero-profile-badge">
              <span>
                CREATIVE
              </span>

              <strong>
                +
              </strong>

              <span>
                TECHNOLOGY
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;