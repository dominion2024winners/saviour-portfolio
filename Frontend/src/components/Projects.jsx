import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Projects.css";
import { useTranslation } from "../utils/i18n";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const CATEGORY_ORDER = [
  "Web Development",
  "Graphic Design",
  "Branding",
  "Digital Marketing",
  "Mobile Development",
  "Other",
];

const readStorage = (key, fallback) => {
  try {
    const currentValue = localStorage.getItem(key);
    return currentValue ? JSON.parse(currentValue) : fallback;
  } catch (error) {
    return fallback;
  }
};

function Projects() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [technologyFilter, setTechnologyFilter] = useState("All");

  // ============================================================
  // LOAD PUBLISHED PROJECTS
  // ============================================================

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/projects`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load projects."
          );
        }

        const loadedProjects = data.projects || [];
        const storedProjects = readStorage("portfolioProjects", []);
        setProjects(loadedProjects.length > 0 ? loadedProjects : storedProjects);
      } catch (err) {
        console.error(
          "Load portfolio projects error:",
          err
        );

        const storedProjects = readStorage("portfolioProjects", []);
        setProjects(storedProjects);
        setError("");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // ============================================================
  // GROUP PROJECTS BY CATEGORY
  // ============================================================

  const categories = useMemo(
    () => ["All", ...new Set(projects.map((project) => project.category || "Other"))],
    [projects]
  );

  const technologies = useMemo(
    () => ["All", ...new Set(projects.flatMap((project) => project.technologies || []))],
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects.filter((project) => {
      const searchable = [
        project.title,
        project.description,
        project.category,
        project.clientType,
        ...(project.technologies || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (categoryFilter === "All" || project.category === categoryFilter) &&
        (technologyFilter === "All" ||
          project.technologies?.includes(technologyFilter))
      );
    });
  }, [projects, query, categoryFilter, technologyFilter]);

  const projectsByCategory = useMemo(() => {
    const grouped = {};

    filteredProjects.forEach((project) => {
      const category =
        project.category?.trim() || "Other";

      if (!grouped[category]) {
        grouped[category] = [];
      }

      grouped[category].push(project);
    });

    return grouped;
  }, [filteredProjects]);

  // ============================================================
  // FORMAT CATEGORY NAME
  // ============================================================

  const getCategoryClass = (category) => {
    return category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section
      id="projects"
      className="section projects-section"
    >
      <div className="container">

        {/* ======================================================
            SECTION HEADER
        ====================================================== */}

        <div className="section-header">
          <span className="section-label">
            MY WORK
          </span>

          <h2 className="section-title">
            Selected
            <span> Projects.</span>
          </h2>

          <p className="section-description">
            A collection of websites, branding projects,
            graphic designs and digital experiences.
          </p>
        </div>

        <div className="project-filters" aria-label="Project filters">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchProjects")}
            aria-label="Search projects"
          />
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
          <select value={technologyFilter} onChange={(event) => setTechnologyFilter(event.target.value)}>
            {technologies.map((technology) => <option key={technology}>{technology}</option>)}
          </select>
        </div>

        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div className="projects-loading">
            <div className="projects-loading-spinner"></div>

            <p>
              Loading projects...
            </p>
          </div>
        )}

        {/* ======================================================
            ERROR
        ====================================================== */}

        {!loading && error && (
          <div className="projects-error">
            <div className="projects-error-icon">
              !
            </div>

            <h3>
              Unable to load projects
            </h3>

            <p>
              {error}
            </p>
          </div>
        )}

        {/* ======================================================
            NO PROJECTS
        ====================================================== */}

        {!loading &&
          !error &&
          projects.length === 0 && (
            <div className="projects-empty">

              <div className="projects-empty-icon">
                +
              </div>

              <h3>
                Projects coming soon
              </h3>

              <p>
                New projects will be added to this portfolio.
              </p>

            </div>
          )}

        {/* ======================================================
            PROJECT CATEGORIES
        ====================================================== */}

        {!loading &&
          !error &&
          filteredProjects.length > 0 && (
            <div className="projects-categories">

              {/*
               * First display categories in the predefined
               * order used by the admin dashboard.
               */}
              {[...CATEGORY_ORDER, ...categories.filter((category) => !CATEGORY_ORDER.includes(category))].map((category) => {
                const categoryProjects =
                  projectsByCategory[category];

                if (
                  !categoryProjects ||
                  categoryProjects.length === 0
                ) {
                  return null;
                }

                return (
                  <section
                    className={`project-category project-category-${getCategoryClass(
                      category
                    )}`}
                    key={category}
                  >

                    {/* CATEGORY HEADER */}

                    <div className="project-category-header">

                      <div>
                        <span className="project-category-label">
                          CATEGORY
                        </span>

                        <h3>
                          {category}
                        </h3>
                      </div>

                      <span className="project-category-count">
                        {categoryProjects.length}{" "}
                        {categoryProjects.length === 1
                          ? "Project"
                          : "Projects"}
                      </span>

                    </div>

                    {/* PROJECT GRID */}

                    <div className="projects-grid">

                      {categoryProjects.map(
                        (project) => (
                          <article
                            className="project-card"
                            key={project._id || project.id || project.title}
                          >

                            {/* PROJECT IMAGE */}

                            <div className="project-card-image-wrapper">

                              {project.image ? (
                                <img
                                  src={project.image}
                                  alt={project.title}
                                  className="project-card-image"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="project-card-image-placeholder">
                                  <span>
                                    {project.title
                                      ?.charAt(0)
                                      ?.toUpperCase() ||
                                      "P"}
                                  </span>
                                </div>
                              )}

                              <div className="project-card-category">
                                {project.category}
                              </div>

                            </div>

                            {/* PROJECT CONTENT */}

                            <div className="project-card-content">

                              <h4>
                                {project.title}
                              </h4>

                              <p>
                                {project.description}
                              </p>

                              {/* TECHNOLOGIES */}

                              {project.technologies?.length >
                                0 && (
                                <div className="project-technologies">

                                  {project.technologies.map(
                                    (
                                      technology,
                                      index
                                    ) => (
                                      <span
                                        key={`${technology}-${index}`}
                                      >
                                        {technology}
                                      </span>
                                    )
                                  )}

                                </div>
                              )}

                              {/* LINKS */}

                              {(project.liveUrl ||
                                project.githubUrl ||
                                project._id) && (
                                <div className="project-card-links">

                                  <Link
                                    to={`/projects/${project._id || project.id}`}
                                    className="project-card-link tertiary"
                                  >
                                    Details
                                  </Link>

                                  {project.liveUrl && (
                                    <a
                                      href={
                                        project.liveUrl
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="project-card-link primary"
                                    >
                                      View Project
                                    </a>
                                  )}

                                  {project.githubUrl && (
                                    <a
                                      href={
                                        project.githubUrl
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="project-card-link secondary"
                                    >
                                      GitHub
                                    </a>
                                  )}

                                </div>
                              )}

                              {/* DOWNLOADABLE FILES */}

                              {project.files?.length >
                                0 && (
                                <div className="project-downloads">

                                  <span className="project-downloads-title">
                                    Downloadable Files
                                  </span>

                                  <div className="project-download-list">

                                    {project.files.map(
                                      (file) => (
                                        <a
                                          key={
                                            file._id ||
                                            file.publicId ||
                                            file.url
                                          }
                                          href={
                                            file._id && project._id
                                              ? `${API_URL}/api/projects/${project._id}/files/${file._id}/download`
                                              : file.url
                                          }
                                          download={
                                            file._id && project._id
                                              ? undefined
                                              : file.name
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="project-download-link"
                                          aria-label={`Download ${file.name}`}
                                        >
                                          {file.name}
                                        </a>
                                      )
                                    )}

                                  </div>

                                </div>
                              )}

                            </div>

                          </article>
                        )
                      )}

                    </div>

                  </section>
                );
              })}
              {Object.keys(projectsByCategory).length === 0 && (
                <div className="projects-empty">No projects match those filters.</div>
              )}

              {/* ==================================================
                  CUSTOM / UNKNOWN CATEGORIES
              ================================================== */}

              {Object.keys(projectsByCategory)
                .filter(
                  (category) =>
                    !CATEGORY_ORDER.includes(
                      category
                    )
                )
                .map((category) => {
                  const categoryProjects =
                    projectsByCategory[category];

                  return (
                    <section
                      className="project-category"
                      key={category}
                    >

                      <div className="project-category-header">

                        <div>
                          <span className="project-category-label">
                            CATEGORY
                          </span>

                          <h3>
                            {category}
                          </h3>
                        </div>

                        <span className="project-category-count">
                          {categoryProjects.length}{" "}
                          {categoryProjects.length === 1
                            ? "Project"
                            : "Projects"}
                        </span>

                      </div>

                      <div className="projects-grid">

                        {categoryProjects.map(
                          (project) => (
                            <article
                              className="project-card"
                              key={project._id || project.id || project.title}
                            >

                              <div className="project-card-image-wrapper">

                                {project.image ? (
                                  <img
                                    src={project.image}
                                    alt={
                                      project.title
                                    }
                                    className="project-card-image"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="project-card-image-placeholder">
                                    <span>
                                      {project.title
                                        ?.charAt(
                                          0
                                        )
                                        ?.toUpperCase() ||
                                        "P"}
                                    </span>
                                  </div>
                                )}

                                <div className="project-card-category">
                                  {project.category}
                                </div>

                              </div>

                              <div className="project-card-content">

                                <h4>
                                  {project.title}
                                </h4>

                                <p>
                                  {project.description}
                                </p>

                                {project
                                  .technologies
                                  ?.length >
                                  0 && (
                                  <div className="project-technologies">

                                    {project.technologies.map(
                                      (
                                        technology,
                                        index
                                      ) => (
                                        <span
                                          key={`${technology}-${index}`}
                                        >
                                          {technology}
                                        </span>
                                      )
                                    )}

                                  </div>
                                )}

                                {(project.liveUrl ||
                                  project.githubUrl ||
                                  project._id) && (
                                  <div className="project-card-links">

                                    <Link
                                      to={`/projects/${project._id || project.id}`}
                                      className="project-card-link tertiary"
                                    >
                                      Details
                                    </Link>

                                    {project.liveUrl && (
                                      <a
                                        href={
                                          project.liveUrl
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="project-card-link primary"
                                      >
                                        View Project
                                      </a>
                                    )}

                                    {project.githubUrl && (
                                      <a
                                        href={
                                          project.githubUrl
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="project-card-link secondary"
                                      >
                                        GitHub
                                      </a>
                                    )}

                                  </div>
                                )}

                              </div>

                            </article>
                          )
                        )}

                      </div>

                    </section>
                  );
                })}

            </div>
          )}

      </div>
    </section>
  );
}

export default Projects;