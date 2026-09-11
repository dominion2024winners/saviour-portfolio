const Project = require("../models/Project");

// ============================================================
// GET ALL PUBLISHED PROJECTS
// ============================================================

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      published: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};


// ============================================================
// GET ALL PROJECTS FOR ADMIN
// ============================================================

const getAdminProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get admin projects error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};


// ============================================================
// GET SINGLE PROJECT
// ============================================================

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
    });
  }
};


// ============================================================
// CREATE PROJECT
// ============================================================

const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      clientType,
      challenge,
      solution,
      results,
      technologies,
      image,
      projectUrl,
      githubUrl,
      featured,
      published,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description and category are required",
      });
    }

    let parsedTechnologies = technologies;

    if (typeof technologies === "string") {
      try {
        parsedTechnologies = JSON.parse(technologies);
      } catch {
        parsedTechnologies = technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    const project = await Project.create({
      title,
      description,
      category,
      clientType,
      challenge,
      solution,
      results,
      technologies: Array.isArray(parsedTechnologies)
        ? parsedTechnologies
        : [],
      image: image || "",
      projectUrl: projectUrl || "",
      githubUrl: githubUrl || "",
      featured: featured === true || featured === "true",
      published:
        published === undefined
          ? true
          : published === true || published === "true",
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};


// ============================================================
// UPDATE PROJECT
// ============================================================

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const {
      title,
      description,
      category,
      clientType,
      challenge,
      solution,
      results,
      technologies,
      image,
      projectUrl,
      githubUrl,
      featured,
      published,
    } = req.body;

    if (title !== undefined) {
      project.title = title;
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (category !== undefined) {
      project.category = category;
    }

    if (clientType !== undefined) project.clientType = clientType;
    if (challenge !== undefined) project.challenge = challenge;
    if (solution !== undefined) project.solution = solution;
    if (results !== undefined) project.results = results;

    if (technologies !== undefined) {
      if (Array.isArray(technologies)) {
        project.technologies = technologies;
      } else if (typeof technologies === "string") {
        try {
          project.technologies = JSON.parse(technologies);
        } catch {
          project.technologies = technologies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      }
    }

    if (image !== undefined) {
      project.image = image;
    }

    if (projectUrl !== undefined) {
      project.projectUrl = projectUrl;
    }

    if (githubUrl !== undefined) {
      project.githubUrl = githubUrl;
    }

    if (featured !== undefined) {
      project.featured =
        featured === true || featured === "true";
    }

    if (published !== undefined) {
      project.published =
        published === true || published === "true";
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
};


// ============================================================
// DELETE PROJECT
// ============================================================

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};


module.exports = {
  getProjects,
  getAdminProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};