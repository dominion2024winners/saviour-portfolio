import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./ProjectDetail.css";
import { trackAnalyticsEvent } from "../utils/analytics";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const readStorage = (key, fallback) => {
  try {
    const currentValue = localStorage.getItem(key);
    return currentValue ? JSON.parse(currentValue) : fallback;
  } catch (error) {
    return fallback;
  }
};

function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/projects/${projectId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Project could not be loaded.");
        }

        const loadedProject = data.project;

        if (loadedProject) {
          setProject(loadedProject);
          trackAnalyticsEvent({
            type: "project_view",
            path: `/projects/${projectId}`,
            contentId: loadedProject._id || projectId,
            contentTitle: loadedProject.title,
          });
          return;
        }

        const storedProjects = readStorage("portfolioProjects", []);
        const matchedProject = storedProjects.find(
          (item) => item._id === projectId || item.id === projectId
        );

        if (matchedProject) {
          setProject(matchedProject);
          trackAnalyticsEvent({
            type: "project_view",
            path: `/projects/${projectId}`,
            contentId: matchedProject._id || projectId,
            contentTitle: matchedProject.title,
          });
          return;
        }

        setProject(null);
        setError("Project not found.");
      } catch (err) {
        console.error("Load project detail error:", err);

        const storedProjects = readStorage("portfolioProjects", []);
        const matchedProject = storedProjects.find(
          (item) => item._id === projectId || item.id === projectId
        );

        setProject(matchedProject || null);
        setError(matchedProject ? "" : "Unable to load this project right now.");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  if (loading) {
    return (
      <main className="project-detail-page">
        <div className="project-detail-loading">Loading project details…</div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="project-detail-page">
        <div className="project-detail-not-found">
          <span className="project-detail-tag">PROJECT</span>
          <h1>Project unavailable</h1>
          <p>{error || "This project is not available at the moment."}</p>
          <Link to="/" className="project-detail-back-link">
            Back to portfolio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="project-detail-page">
      <div className="project-detail-shell">
        <Link to="/" className="project-detail-back-link">
          ← Back to portfolio
        </Link>

        <article className="project-detail-card">
          {project.image ? (
            <img
              src={project.image}
              alt={project.title}
              className="project-detail-image"
            />
          ) : (
            <div className="project-detail-image-placeholder">
              <span>{project.title?.charAt(0)?.toUpperCase() || "P"}</span>
            </div>
          )}

          <div className="project-detail-body">
            <span className="project-detail-tag">{project.category || "Project"}</span>
            <h1>{project.title}</h1>
            <p className="project-detail-description">{project.description}</p>

            {(project.clientType || project.challenge || project.solution || project.results) && (
              <div className="project-case-study">
                <h2>Case study</h2>
                {project.clientType && <p><strong>Client:</strong> {project.clientType}</p>}
                {project.challenge && <p><strong>Challenge:</strong> {project.challenge}</p>}
                {project.solution && <p><strong>Solution:</strong> {project.solution}</p>}
                {project.results && <p><strong>Results:</strong> {project.results}</p>}
              </div>
            )}

            {project.technologies?.length > 0 && (
              <div className="project-detail-techs">
                {project.technologies.map((technology, index) => (
                  <span key={`${technology}-${index}`}>{technology}</span>
                ))}
              </div>
            )}

            {(project.liveUrl || project.githubUrl) && (
              <div className="project-detail-links">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-detail-link primary"
                  >
                    View live project
                  </a>
                )}

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-detail-link secondary"
                  >
                    GitHub repository
                  </a>
                )}
              </div>
            )}

            {project.files?.length > 0 && (
              <div className="project-detail-files">
                <h2>Downloadable files</h2>
                <ul>
                  {project.files.map((file) => (
                    <li key={file._id || file.publicId || file.url}>
                      <a
                        href={
                          file._id && project._id
                            ? `${API_URL}/api/projects/${project._id}/files/${file._id}/download`
                            : file.url
                        }
                        download={file._id && project._id ? undefined : file.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Download ${file.name}`}
                      >
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}

export default ProjectDetail;
