import { useEffect, useState } from "react";
import "./Skills.css";

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

function Skills() {
  const [skills, setSkills] = useState(() =>
    readStorage("portfolioSkills", [
      "Graphic Design",
      "Brand Identity",
      "HTML & CSS",
      "JavaScript",
      "React.js",
      "Node.js",
      "MongoDB",
      "Express.js",
      "Git & GitHub",
    ])
  );

  useEffect(() => {
    setSkills(readStorage("portfolioSkills", [
      "Graphic Design",
      "Brand Identity",
      "HTML & CSS",
      "JavaScript",
      "React.js",
      "Node.js",
      "MongoDB",
      "Express.js",
      "Git & GitHub",
    ]));
  }, []);

  return (
    <section id="skills" className="section skills-section">
      <div className="container">

        <div className="section-header">
          <span className="section-label">
            MY SKILLS
          </span>

          <h2 className="section-title">
            Skills I use to bring
            <span> ideas to life.</span>
          </h2>

          <p className="section-description">
            A combination of creative and technical skills that
            allows me to handle projects from concept to completion.
          </p>
        </div>

        <div className="skills-grid">
          {skills.map((skill, index) => (
            <div
              className="skill-card"
              key={skill}
            >
              <span>
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3>
                {skill}
              </h3>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Skills;