import { useEffect, useRef, useState } from "react";
import "./AdminDashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyForm = {
  title: "",
  description: "",
  category: "",
  clientType: "",
  challenge: "",
  solution: "",
  results: "",
  technologies: [],
  image: "",
  liveUrl: "",
  githubUrl: "",
  featured: false,
  published: true,
};

const TECHNOLOGY_OPTIONS = [
  "CorelDRAW",
  "Photoshop",
  "illustrator",
  "InDesign",
  "HTML",
  "CSS",
  "JavaScript",
  "React.js",
  "Node.js",
  "Express.js",
  "MongoDB",
];

const STORAGE_KEYS = {
  profile: "portfolioProfileData",
  siteSettings: "portfolioSiteSettings",
  services: "portfolioServices",
  skills: "portfolioSkills",
  testimonials: "portfolioTestimonials",
  blogPosts: "portfolioBlogPosts",
  media: "portfolioMediaLibrary",
  adminCredentials: "portfolioAdminCredentials",
  adminPassword: "portfolioAdminPassword",
};

const defaultSiteSettings = {
  brandName: "Saviour Nkantion",
  title: "Graphic Designer & Developer",
  tagline: "I create digital experiences that stand out.",
  heroTitle: "I create digital experiences that stand out.",
  heroDescription:
    "I design and build modern websites, visual identities, digital experiences and creative solutions for brands, businesses and individuals.",
  email: "hello@yourdomain.com",
  phone: "+1 (555) 123-4567",
  location: "Based in your city",
  primaryButton: "View My Work",
  secondaryButton: "Let's Work Together",
  websiteEnabled: true,
};

const defaultServices = [
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
];

const defaultSkills = [
  "Graphic Design",
  "Brand Identity",
  "HTML & CSS",
  "JavaScript",
  "React.js",
  "Node.js",
  "MongoDB",
  "Express.js",
  "Git & GitHub",
];

const defaultTestimonials = [
  {
    id: "testimonial-1",
    name: "Client Name",
    role: "Marketing Lead",
    quote:
      "The work was polished, strategic and delivered ahead of schedule.",
    rating: 5,
  },
  {
    id: "testimonial-2",
    name: "Brand Owner",
    role: "Founder",
    quote:
      "The new identity and website gave our business the presence it needed.",
    rating: 5,
  },
];

const defaultBlogPosts = [
  {
    id: "blog-1",
    title: "What makes a portfolio actually convert?",
    category: "Brand Strategy",
    date: "2026-09-10",
    readTime: "4 min read",
    excerpt:
      "A strong portfolio is not just a gallery of work; it is a clear story about value, process, and trust.",
    content:
      "A compelling portfolio does more than display visuals. It gives prospective clients confidence by showing the thinking behind the work, the outcomes that matter, and the simple path to working together.",
  },
  {
    id: "blog-2",
    title: "How clear positioning improves client response",
    category: "Digital Presence",
    date: "2026-08-22",
    readTime: "3 min read",
    excerpt:
      "When your positioning is clear, potential clients understand your value before the first conversation even starts.",
    content:
      "Businesses and founders often buy clarity before they buy design. A focused value proposition and a consistent visual presence help clients feel confident enough to reach out.",
  },
];

const defaultProfileData = {
  name: "Saviour Nkantion",
  title: "Graphic Designer & Developer",
  bio: "I build polished digital experiences that help brands stand out.",
  email: "hello@yourdomain.com",
  location: "Your City",
  instagram: "https://instagram.com",
  linkedin: "https://linkedin.com",
  behance: "https://behance.net",
  github: "https://github.com",
};

const readStoredValue = (key, fallback) => {
  try {
    if (typeof window === "undefined") {
      return fallback;
    }

    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed;
    }

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
      };
    }

    return parsed;
  } catch (error) {
    console.warn(`Unable to read local storage key: ${key}`, error);
    return fallback;
  }
};

const writeStoredValue = (key, value) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.warn(`Unable to write local storage key: ${key}`, error);
  }
};

function AdminDashboard() {
  // ============================================================
  // PROJECT STATE
  // ============================================================

  const [projects, setProjects] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [projectFiles, setProjectFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [siteSettings, setSiteSettings] = useState(() =>
    readStoredValue(STORAGE_KEYS.siteSettings, defaultSiteSettings)
  );
  const [services, setServices] = useState(() =>
    readStoredValue(STORAGE_KEYS.services, defaultServices)
  );
  const [skills, setSkills] = useState(() =>
    readStoredValue(STORAGE_KEYS.skills, defaultSkills)
  );
  const [testimonials, setTestimonials] = useState(() =>
    readStoredValue(STORAGE_KEYS.testimonials, defaultTestimonials)
  );
  const [blogPosts, setBlogPosts] = useState(() =>
    readStoredValue(STORAGE_KEYS.blogPosts, defaultBlogPosts)
  );
  const [profileDetails, setProfileDetails] = useState(() =>
    readStoredValue(STORAGE_KEYS.profile, defaultProfileData)
  );
  const [mediaItems, setMediaItems] = useState(() =>
    readStoredValue(STORAGE_KEYS.media, [])
  );
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    projectViews: 0,
    blogViews: 0,
    leads: 0,
    topProjects: [],
    topPosts: [],
    recentEvents: [],
  });
  const [profileForm, setProfileForm] = useState(() =>
    readStoredValue(STORAGE_KEYS.profile, defaultProfileData)
  );
  const [serviceForm, setServiceForm] = useState({
    id: "",
    title: "",
    description: "",
  });
  const [testimonialForm, setTestimonialForm] = useState({
    id: "",
    name: "",
    role: "",
    quote: "",
    rating: 5,
  });
  const [blogForm, setBlogForm] = useState({
    id: "",
    title: "",
    category: "",
    readTime: "",
    date: "",
    excerpt: "",
    content: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [mediaMessage, setMediaMessage] = useState("");

  // ============================================================
  // PROFILE IMAGE STATE
  // ============================================================

  const [profileImage, setProfileImage] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImageLoading, setProfileImageLoading] =
    useState(false);
  const [cvUrl, setCvUrl] = useState("");
  const [cvName, setCvName] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [cvLoading, setCvLoading] = useState(false);

  // ============================================================
  // GENERAL MESSAGES
  // ============================================================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // FILE INPUT REFERENCES
  // ============================================================

  const profileImageInputRef = useRef(null);
  const cvInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // ============================================================
  // GET ADMIN TOKEN
  // ============================================================

  const getToken = () => {
    return localStorage.getItem("adminToken");
  };

  // ============================================================
  // LOAD ALL PROJECTS
  // ============================================================

  const loadProjects = async () => {
    try {
      setProjectsLoading(true);

      const token = getToken();

      if (!token) {
        setError("Your admin session has expired. Please login again.");
        setOfflineMode(true);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/projects/admin/all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("adminToken");
          setOfflineMode(true);
          setProjects([]);
          return;
        }

        throw new Error(data.message || "Failed to load projects.");
      }

      setProjects(data.projects || []);
      setOfflineMode(false);
    } catch (err) {
      console.error("Load projects error:", err);
      setOfflineMode(true);
      setProjects([]);
      setError(err.message || "Failed to load projects.");
    } finally {
      setProjectsLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      setContactsLoading(true);
      const token = getToken();

      if (!token) {
        setOfflineMode(true);
        return;
      }

      const response = await fetch(`${API_URL}/api/contact`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("adminToken");
          setOfflineMode(true);
          setContacts([]);
          return;
        }

        throw new Error(data.message || "Failed to load inquiries.");
      }

      setContacts(data.contacts || []);
      setOfflineMode(false);
    } catch (err) {
      console.error("Load inquiries error:", err);
      setOfflineMode(true);
      setContacts([]);
      setError(err.message || "Failed to load inquiries.");
    } finally {
      setContactsLoading(false);
    }
  };

  const loadBlogPosts = async () => {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/blog/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load blog posts.");
      }

      setBlogPosts(data.posts || []);
    } catch (err) {
      console.warn("Load admin blog posts error:", err);
      setOfflineMode(true);
    }
  };

  const loadAnalytics = async () => {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load analytics.");
      }

      setAnalytics(data.analytics || {});
    } catch (err) {
      console.warn("Load analytics error:", err);
      setOfflineMode(true);
    }
  };

  const updateContactStatus = async (id, status) => {
    try {
      const response = await fetch(
        `${API_URL}/api/contact/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update inquiry.");
      }

      setContacts((current) =>
        current.map((contact) =>
          contact._id === id ? data.contact : contact
        )
      );
    } catch (err) {
      console.error("Update inquiry status error:", err);
      setError(err.message || "Failed to update inquiry.");
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm("Delete this inquiry?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/contact/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete inquiry.");
      }

      setContacts((current) =>
        current.filter((contact) => contact._id !== id)
      );
    } catch (err) {
      console.error("Delete inquiry error:", err);
      setError(err.message || "Failed to delete inquiry.");
    }
  };

  const toggleWebsiteStatus = async (nextEnabled) => {
    const token = getToken();

    if (!token) {
      setError("Your admin session has expired. Please login again.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/api/settings/site-status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ websiteEnabled: nextEnabled }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update website status.");
      }

      setSiteSettings((current) => ({
        ...current,
        websiteEnabled: nextEnabled,
      }));

      setMessage(
        nextEnabled
          ? "Website enabled successfully. Visitors can view the portfolio again."
          : "Website disabled successfully. Public access is now blocked."
      );
    } catch (err) {
      console.error("Toggle website status error:", err);
      setError(err.message || "Failed to update website status.");
    }
  };

  // ============================================================
  // LOAD PROFILE
  // ============================================================

  const loadProfile = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/profile`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load profile."
        );
      }

      const nextProfileImage = data.profile?.profileImage || "";
      setProfileImage(nextProfileImage);
      setCvUrl(data.profile?.cvUrl || "");
      setCvName(data.profile?.cvName || "");
      if (data.profile?.email) {
        setProfileDetails((current) => ({
          ...current,
          email: data.profile.email,
        }));
        setProfileForm((current) => ({
          ...current,
          email: data.profile.email,
        }));
      }
      localStorage.setItem("portfolioProfileImage", JSON.stringify(nextProfileImage));
    } catch (err) {
      console.error("Load profile error:", err);
    }
  };

  const handleCvChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a PDF, DOC, or DOCX file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("CV must not exceed 10MB.");
      event.target.value = "";
      return;
    }

    setCvFile(file);
    setMessage("");
    setError("");
  };

  const handleCvUpload = async () => {
    if (!cvFile) {
      setError("Please select a CV file first.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Your admin session has expired. Please login again.");
      return;
    }

    try {
      setCvLoading(true);
      setMessage("");
      setError("");

      const formData = new FormData();
      formData.append("cv", cvFile);

      const response = await fetch(`${API_URL}/api/profile/cv`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload CV.");
      }

      setCvUrl(data.profile?.cvUrl || "");
      setCvName(data.profile?.cvName || cvFile.name);
      setCvFile(null);
      if (cvInputRef.current) {
        cvInputRef.current.value = "";
      }
      setMessage("CV uploaded successfully.");
    } catch (err) {
      console.error("CV upload error:", err);
      setError(err.message || "Failed to upload CV.");
    } finally {
      setCvLoading(false);
    }
  };

  const handleRemoveCv = async () => {
    if (!window.confirm("Are you sure you want to remove your CV?")) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Your admin session has expired. Please login again.");
      return;
    }

    try {
      setCvLoading(true);
      const response = await fetch(`${API_URL}/api/profile/cv`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove CV.");
      }

      setCvUrl("");
      setCvName("");
      setCvFile(null);
      setMessage("CV removed successfully.");
    } catch (err) {
      console.error("CV removal error:", err);
      setError(err.message || "Failed to remove CV.");
    } finally {
      setCvLoading(false);
    }
  };

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    loadProjects();
    loadProfile();
    loadContacts();
    loadBlogPosts();
    loadAnalytics();
  }, []);

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.siteSettings, siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.services, services);
  }, [services]);

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.skills, skills);
  }, [skills]);

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.testimonials, testimonials);
  }, [testimonials]);

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.blogPosts, blogPosts);
  }, [blogPosts]);

  useEffect(() => {
    setProfileForm(profileDetails);
    writeStoredValue(STORAGE_KEYS.profile, profileDetails);
  }, [profileDetails]);

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.media, mediaItems);
  }, [mediaItems]);

  // ============================================================
  // HANDLE PROFILE IMAGE SELECTION
  // ============================================================

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Only images
    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    // Maximum 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Profile image must not exceed 10MB."
      );

      event.target.value = "";
      return;
    }

    // Clean up previous temporary preview
    if (
      profileImage &&
      profileImage.startsWith("blob:")
    ) {
      URL.revokeObjectURL(profileImage);
    }

    const previewUrl = URL.createObjectURL(file);

    setProfileImageFile(file);
    setProfileImage(previewUrl);

    setMessage("");
    setError("");
  };

  // ============================================================
  // UPLOAD / REPLACE PROFILE IMAGE
  // ============================================================

  const handleProfileImageUpload = async () => {
    if (!profileImageFile) {
      setError(
        "Please select a profile image first."
      );

      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Your admin session has expired. Please login again."
      );

      return;
    }

    try {
      setProfileImageLoading(true);
      setMessage("");
      setError("");

      const formData = new FormData();

      formData.append(
        "profileImage",
        profileImageFile
      );

      const response = await fetch(
        `${API_URL}/api/profile/image`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem("adminToken");

          throw new Error(
            "Your admin session has expired. Please login again."
          );
        }

        throw new Error(
          data.message ||
            "Failed to update profile picture."
        );
      }

      // Clean temporary blob preview
      if (
        profileImage &&
        profileImage.startsWith("blob:")
      ) {
        URL.revokeObjectURL(profileImage);
      }

      const nextProfileImage = data.profile?.profileImage || "";

      setProfileImage(nextProfileImage);
      localStorage.setItem("portfolioProfileImage", JSON.stringify(nextProfileImage));

      setProfileImageFile(null);

      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = "";
      }

      setMessage(
        "Profile picture updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile image upload error:",
        err
      );

      setError(
        err.message ||
          "Failed to update profile picture."
      );
    } finally {
      setProfileImageLoading(false);
    }
  };

  // ============================================================
  // REMOVE PROFILE IMAGE
  // ============================================================

  const handleRemoveProfileImage = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove your profile picture?"
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Your admin session has expired. Please login again."
      );

      return;
    }

    try {
      setProfileImageLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/api/profile/image`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem("adminToken");

          throw new Error(
            "Your admin session has expired. Please login again."
          );
        }

        throw new Error(
          data.message ||
            "Failed to remove profile picture."
        );
      }

      // Clean temporary preview if necessary
      if (
        profileImage &&
        profileImage.startsWith("blob:")
      ) {
        URL.revokeObjectURL(profileImage);
      }

      setProfileImage("");
      localStorage.setItem("portfolioProfileImage", JSON.stringify(""));
      setProfileImageFile(null);

      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = "";
      }

      setMessage(
        "Profile picture removed successfully."
      );
    } catch (err) {
      console.error(
        "Remove profile image error:",
        err
      );

      setError(
        err.message ||
          "Failed to remove profile picture."
      );
    } finally {
      setProfileImageLoading(false);
    }
  };

  // ============================================================
  // HANDLE PROJECT INPUT
  // ============================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleTechnologyToggle = (technology) => {
    setForm((previous) => {
      const isSelected = previous.technologies.includes(technology);

      return {
        ...previous,
        technologies: isSelected
          ? previous.technologies.filter(
              (item) => item !== technology
            )
          : [...previous.technologies, technology],
      };
    });
  };

  // ============================================================
  // HANDLE PROJECT FILE SELECTION
  // ============================================================

  const handleProjectImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file for the project preview.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((previous) => ({
        ...previous,
        image: String(reader.result || ""),
      }));
      setError("");
      setMessage("Project preview image selected.");
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    setProjectFiles((currentFiles) => {
      const combinedFiles = [
        ...currentFiles,
        ...selectedFiles,
      ];

      if (combinedFiles.length > 10) {
        setError(
          "You can upload a maximum of 10 files at a time."
        );

        return combinedFiles.slice(0, 10);
      }

      return combinedFiles;
    });

    // Allow selecting the same file again
    event.target.value = "";
  };

  // ============================================================
  // REMOVE NEWLY SELECTED PROJECT FILE
  // ============================================================

  const removeSelectedFile = (indexToRemove) => {
    setProjectFiles((currentFiles) =>
      currentFiles.filter(
        (_, index) =>
          index !== indexToRemove
      )
    );
  };

  // ============================================================
  // RESET PROJECT FORM
  // ============================================================

  const resetForm = () => {
    setForm({
      ...emptyForm,
    });

    setProjectFiles([]);
    setEditingId(null);
    setMessage("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // CREATE / UPDATE PROJECT
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const token = getToken();

    if (!token) {
      setError(
        "Your admin session has expired. Please login again."
      );

      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      // --------------------------------------------------------
      // PROJECT INFORMATION
      // --------------------------------------------------------

      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "category",
        form.category.trim()
      );
      formData.append("clientType", form.clientType.trim());
      formData.append("challenge", form.challenge.trim());
      formData.append("solution", form.solution.trim());
      formData.append("results", form.results.trim());

      formData.append(
        "technologies",
        JSON.stringify(form.technologies)
      );

      formData.append(
        "image",
        form.image.trim()
      );

      formData.append(
        "liveUrl",
        form.liveUrl.trim()
      );

      formData.append(
        "githubUrl",
        form.githubUrl.trim()
      );

      formData.append(
        "featured",
        String(form.featured)
      );

      formData.append(
        "published",
        String(form.published)
      );

      // --------------------------------------------------------
      // UPLOAD NEW PROJECT FILES
      // --------------------------------------------------------

      projectFiles.forEach((file) => {
        formData.append(
          "projectFiles",
          file
        );
      });

      // --------------------------------------------------------
      // CREATE OR UPDATE
      // --------------------------------------------------------

      const url = editingId
        ? `${API_URL}/api/projects/${editingId}`
        : `${API_URL}/api/projects`;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem("adminToken");

          throw new Error(
            "Your admin session has expired. Please login again."
          );
        }

        throw new Error(
          data.message ||
            "Failed to save project."
        );
      }

      setMessage(
        editingId
          ? "Project updated successfully."
          : "Project added successfully."
      );

      // --------------------------------------------------------
      // RESET FORM
      // --------------------------------------------------------

      setForm({
        ...emptyForm,
      });

      setProjectFiles([]);
      setEditingId(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // --------------------------------------------------------
      // REFRESH PROJECTS
      // --------------------------------------------------------

      await loadProjects();
    } catch (err) {
      console.error(
        "Save project error:",
        err
      );

      setError(
        err.message ||
          "Failed to save project."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // EDIT PROJECT
  // ============================================================

  const handleEdit = (project) => {
    setEditingId(project._id);

    setForm({
      title: project.title || "",

      description:
        project.description || "",

      category:
        project.category || "",

      clientType: project.clientType || "",
      challenge: project.challenge || "",
      solution: project.solution || "",
      results: project.results || "",

      technologies:
        Array.isArray(project.technologies)
          ? project.technologies
          : [],

      image:
        project.image || "",

      liveUrl:
        project.liveUrl || "",

      githubUrl:
        project.githubUrl || "",

      featured:
        Boolean(project.featured),

      published:
        project.published !== false,
    });

    setProjectFiles([]);

    setMessage("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // DELETE PROJECT
  // ============================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This will also remove all uploaded project files."
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Your admin session has expired. Please login again."
      );
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/projects/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem("adminToken");

          throw new Error(
            "Your admin session has expired. Please login again."
          );
        }

        throw new Error(
          data.message ||
            "Failed to delete project."
        );
      }

      setMessage(
        "Project deleted successfully."
      );

      if (editingId === id) {
        resetForm();
      }

      await loadProjects();
    } catch (err) {
      console.error(
        "Delete project error:",
        err
      );

      setError(
        err.message ||
          "Failed to delete project."
      );
    }
  };

  // ============================================================
  // DELETE EXISTING PROJECT FILE
  // ============================================================

  const handleDeleteExistingFile = async (
    projectId,
    fileId,
    fileName
  ) => {
    if (!fileId) {
      setError(
        "This file cannot be removed because its file ID is missing."
      );

      return;
    }

    const confirmed = window.confirm(
      `Remove "${fileName}" from this project?`
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Your admin session has expired. Please login again."
      );

      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/projects/${projectId}/files/${fileId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem("adminToken");

          throw new Error(
            "Your admin session has expired. Please login again."
          );
        }

        throw new Error(
          data.message ||
            "Failed to remove project file."
        );
      }

      setMessage(
        `"${fileName}" removed successfully.`
      );

      await loadProjects();
    } catch (err) {
      console.error(
        "Delete project file error:",
        err
      );

      setError(
        err.message ||
          "Failed to remove project file."
      );
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("adminToken");

    window.location.href =
      "/admin/login";
  };

  const persistAdminCredentials = (email, password) => {
    const credentials = {
      email: email?.trim() || "admin@portfolio.com",
      password: password?.trim() || "admin123",
    };

    writeStoredValue(STORAGE_KEYS.adminCredentials, credentials);
    localStorage.setItem(STORAGE_KEYS.adminPassword, JSON.stringify(password));
  };

  const handleProfileFormChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveProfileDetails = async () => {
    const cleanedProfile = {
      ...defaultProfileData,
      ...profileForm,
    };

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/profile/details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: cleanedProfile.email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save profile email.");
      }

      setProfileDetails(cleanedProfile);
      setMessage("Profile details saved successfully.");
    } catch (err) {
      console.error("Save profile details error:", err);
      setError(err.message || "Failed to save profile details.");
    }
    setError("");
  };

  const handleServiceFormChange = (event) => {
    const { name, value } = event.target;
    setServiceForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveService = () => {
    const title = serviceForm.title.trim();
    const description = serviceForm.description.trim();

    if (!title || !description) {
      setError("Service title and description are required.");
      return;
    }

    if (serviceForm.id) {
      setServices((current) =>
        current.map((service) =>
          service.id === serviceForm.id
            ? { ...service, title, description }
            : service
        )
      );
      setMessage("Service updated successfully.");
    } else {
      const newService = {
        id: `svc-${Date.now()}`,
        title,
        description,
      };

      setServices((current) => [newService, ...current]);
      setMessage("Service added successfully.");
    }

    setServiceForm({ id: "", title: "", description: "" });
    setError("");
  };

  const editService = (service) => {
    setServiceForm({
      id: service.id,
      title: service.title,
      description: service.description,
    });
    setActiveMenu("services");
  };

  const deleteService = (id) => {
    setServices((current) => current.filter((service) => service.id !== id));
    setMessage("Service removed from the public portfolio.");
    setError("");
  };

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();

    if (!trimmedSkill) {
      setError("Please enter a skill to add.");
      return;
    }

    setSkills((current) => {
      if (current.includes(trimmedSkill)) {
        return current;
      }

      return [...current, trimmedSkill];
    });

    setSkillInput("");
    setMessage("Skill added successfully.");
    setError("");
  };

  const deleteSkill = (skillToDelete) => {
    setSkills((current) =>
      current.filter((skill) => skill !== skillToDelete)
    );
    setMessage("Skill removed.");
    setError("");
  };

  const handleTestimonialFormChange = (event) => {
    const { name, value } = event.target;
    setTestimonialForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveTestimonial = () => {
    const name = testimonialForm.name.trim();
    const role = testimonialForm.role.trim();
    const quote = testimonialForm.quote.trim();
    const rating = Math.min(5, Math.max(1, Number(testimonialForm.rating) || 5));

    if (!name || !role || !quote) {
      setError("Client name, role and testimonial text are required.");
      return;
    }

    if (testimonialForm.id) {
      setTestimonials((current) =>
        current.map((item) =>
          item.id === testimonialForm.id
            ? { ...item, name, role, quote, rating }
            : item
        )
      );
      setMessage("Testimonial updated successfully.");
    } else {
      setTestimonials((current) => [
        {
          id: `testimonial-${Date.now()}`,
          name,
          role,
          quote,
          rating,
        },
        ...current,
      ]);
      setMessage("Testimonial added successfully.");
    }

    setTestimonialForm({ id: "", name: "", role: "", quote: "", rating: 5 });
    setError("");
  };

  const editTestimonial = (testimonial) => {
    setTestimonialForm({
      id: testimonial.id,
      name: testimonial.name,
      role: testimonial.role,
      quote: testimonial.quote,
      rating: testimonial.rating || 5,
    });
    setActiveMenu("testimonials");
  };

  const deleteTestimonial = (id) => {
    setTestimonials((current) =>
      current.filter((testimonial) => testimonial.id !== id)
    );
    setMessage("Testimonial removed.");
    setError("");
  };

  const handleBlogFormChange = (event) => {
    const { name, value } = event.target;
    setBlogForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveBlogPost = async () => {
    const title = blogForm.title.trim();
    const excerpt = blogForm.excerpt.trim();
    const category = blogForm.category.trim();
    const content = blogForm.content.trim();

    if (!title || !excerpt || !category || !content) {
      setError("Title, category, excerpt and content are required.");
      return;
    }

    const token = getToken();
    const payload = {
      title,
      category,
      readTime: blogForm.readTime.trim() || "4 min read",
      date: blogForm.date || new Date().toISOString().slice(0, 10),
      excerpt,
      content,
      published: true,
    };

    try {
      if (!token) {
        throw new Error("Admin session unavailable.");
      }

      const isMongoId = /^[a-f\d]{24}$/i.test(blogForm.id);
      const response = await fetch(
        blogForm.id && isMongoId
          ? `${API_URL}/api/blog/${blogForm.id}`
          : `${API_URL}/api/blog`,
        {
          method: blogForm.id && isMongoId ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save blog post.");
      }

      if (blogForm.id && isMongoId) {
        setBlogPosts((current) =>
          current.map((post) =>
            (post._id || post.id) === blogForm.id ? data.post : post
          )
        );
        setMessage("Blog post updated successfully.");
      } else {
        setBlogPosts((current) => [data.post, ...current]);
        setMessage("Blog post added successfully.");
      }
    } catch (err) {
      console.warn("Save blog post API error:", err);
      setOfflineMode(true);

      if (blogForm.id) {
        setBlogPosts((current) =>
          current.map((post) =>
            (post._id || post.id) === blogForm.id
              ? { ...post, ...payload }
              : post
          )
        );
        setMessage("Blog post updated locally. It will sync when the database is available.");
      } else {
        setBlogPosts((current) => [
          { id: `blog-${Date.now()}`, ...payload },
          ...current,
        ]);
        setMessage("Blog post added locally. It will sync when the database is available.");
      }
    }

    setBlogForm({ id: "", title: "", category: "", readTime: "", date: "", excerpt: "", content: "" });
    setError("");
  };

  const editBlogPost = (post) => {
    setBlogForm({
      id: post.id,
      title: post.title,
      category: post.category,
      readTime: post.readTime,
      date: post.date,
      excerpt: post.excerpt,
      content: post.content,
    });
    setActiveMenu("blog");
  };

  const deleteBlogPost = async (id) => {
    if (!window.confirm("Delete this blog post?")) {
      return;
    }

    const token = getToken();
    const isMongoId = /^[a-f\d]{24}$/i.test(id);

    try {
      if (!token || !isMongoId) {
        throw new Error("This local post is not stored in the database.");
      }

      const response = await fetch(`${API_URL}/api/blog/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete blog post.");
      }

      setBlogPosts((current) =>
        current.filter((post) => (post._id || post.id) !== id)
      );
      setMessage("Blog post removed.");
      setError("");
    } catch (err) {
      console.warn("Delete blog post API error:", err);
      setBlogPosts((current) =>
        current.filter((post) => (post._id || post.id) !== id)
      );
      setMessage("Blog post removed locally.");
      setError("");
    }
  };

  const handleMediaUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files can be added to the media library.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const nextItem = {
        id: `media-${Date.now()}`,
        name: file.name,
        url: reader.result,
      };

      setMediaItems((current) => [nextItem, ...current]);
      setMediaMessage("Media item added to the library.");
      setError("");
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  const deleteMediaItem = (id) => {
    setMediaItems((current) =>
      current.filter((item) => item.id !== id)
    );
    setMediaMessage("Media item removed.");
    setError("");
  };

  const handlePasswordUpdate = (event) => {
    event.preventDefault();

    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const confirmPassword = form.confirmPassword.value.trim();

    if (!email || !password || !confirmPassword) {
      setError("Email, password and confirmation are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    persistAdminCredentials(email, password);
    setMessage("Admin credentials updated successfully.");
    setError("");
    form.reset();
  };

  const overviewStats = [
    { label: "Projects", value: projects.length },
    { label: "Inquiries", value: contacts.length },
    { label: "Services", value: services.length },
    { label: "Skills", value: skills.length },
    { label: "Testimonials", value: testimonials.length },
    { label: "Blog Posts", value: blogPosts.length },
  ];

  const sidebarMenuItems = [
    { id: "overview", label: "Overview", icon: "overview" },
    { id: "profile", label: "Profile", icon: "profile" },
    { id: "projects", label: "Projects", icon: "projects" },
    { id: "inquiries", label: "Inquiries", icon: "inquiries" },
    { id: "services", label: "Services", icon: "services" },
    { id: "skills", label: "Skills", icon: "skills" },
    { id: "testimonials", label: "Testimonials", icon: "testimonials" },
    { id: "blog", label: "Blog", icon: "blog" },
    { id: "settings", label: "Site Settings", icon: "settings" },
    { id: "media", label: "Media", icon: "media" },
    { id: "analytics", label: "Analytics", icon: "analytics" },
    { id: "security", label: "Security", icon: "security" },
    { id: "portfolio", label: "View Portfolio", icon: "portfolio" },
  ];

  const SidebarIcon = ({ name }) => {
    const baseProps = {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
    };

    switch (name) {
      case "overview":
        return (
          <svg {...baseProps}>
            <path d="M3 10.5 12 3l9 7.5V19a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-8.5Z" />
          </svg>
        );
      case "profile":
        return (
          <svg {...baseProps}>
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 19c1.3-2.7 4-4 7-4s5.7 1.3 7 4" />
          </svg>
        );
      case "projects":
        return (
          <svg {...baseProps}>
            <rect x="3" y="4" width="7" height="7" rx="1.5" />
            <rect x="14" y="4" width="7" height="4" rx="1.5" />
            <rect x="14" y="12" width="7" height="8" rx="1.5" />
            <rect x="3" y="13" width="7" height="7" rx="1.5" />
          </svg>
        );
      case "inquiries":
        return (
          <svg {...baseProps}>
            <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
            <path d="m5.5 7 6.5 5 6.5-5" />
          </svg>
        );
      case "services":
        return (
          <svg {...baseProps}>
            <path d="M7 4.5h10A2.5 2.5 0 0 1 19.5 7v10A2.5 2.5 0 0 1 17 19.5H7A2.5 2.5 0 0 1 4.5 17V7A2.5 2.5 0 0 1 7 4.5Z" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
        );
      case "skills":
        return (
          <svg {...baseProps}>
            <path d="m12 2.8 2.5 5.1 5.6.8-4.1 3.9 1 5.5-5-2.7-5 2.7 1-5.5L3.9 8.7l5.6-.8L12 2.8Z" />
          </svg>
        );
      case "testimonials":
        return (
          <svg {...baseProps}>
            <path d="M7 8.5h10M7 12h7M7 15.5h9" />
            <path d="M5.5 6.5A2.5 2.5 0 0 0 3 9v7.5A2.5 2.5 0 0 0 5.5 19h9.5a3 3 0 0 0 3-3V9a2.5 2.5 0 0 0-2.5-2.5H5.5Z" />
          </svg>
        );
      case "blog":
        return (
          <svg {...baseProps}>
            <path d="M6 4.5h8.5L18.5 7v12.5A2.5 2.5 0 0 1 16 22H6A2.5 2.5 0 0 1 3.5 19.5v-12A2.5 2.5 0 0 1 6 4.5Z" />
            <path d="M14.5 4.5V7H18" />
            <path d="M7 11h7M7 15h10" />
          </svg>
        );
      case "settings":
        return (
          <svg {...baseProps}>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2.8v2.1M12 19.1v2.1M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2.8 12h2.1M19.1 12h2.1M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
          </svg>
        );
      case "media":
        return (
          <svg {...baseProps}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="2" />
            <path d="m20 15-4.5-4.5L9 18l-2-2-4 4" />
          </svg>
        );
      case "analytics":
        return (
          <svg {...baseProps}>
            <path d="M5 18V8M12 18V4M19 18v-7" />
            <path d="M3 18h18" />
          </svg>
        );
      case "security":
        return (
          <svg {...baseProps}>
            <path d="M7 10V8a5 5 0 1 1 10 0v2" />
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M12 13v3" />
          </svg>
        );
      case "portfolio":
        return (
          <svg {...baseProps}>
            <path d="M7 17 17 7" />
            <path d="M9 7h8v8" />
            <path d="M5 19V5h14" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getSectionClassName = (sectionId, baseClassName) =>
    `${baseClassName} ${activeMenu === sectionId ? "active-section" : "hidden-section"}`;

  const navigateToSection = (sectionId) => {
    setActiveMenu(sectionId);
    setIsSidebarOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // ============================================================
  // FORMAT FILE SIZE
  // ============================================================

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 KB";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    if (
      bytes <
      1024 * 1024 * 1024
    ) {
      return `${(
        bytes /
        (1024 * 1024)
      ).toFixed(2)} MB`;
    }

    return `${(
      bytes /
      (1024 * 1024 * 1024)
    ).toFixed(2)} GB`;
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="admin-dashboard">
      <div className="admin-container">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="admin-header">
          <div>
            <span className="admin-label">
              ADMIN PANEL
            </span>

            <h1>
              Portfolio Dashboard
            </h1>

            <p>
              Manage your portfolio projects
              from one place.
            </p>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        <button
          type="button"
          className="admin-menu-toggle"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsSidebarOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 7h18M3 12h18M3 17h18" />
          </svg>
        </button>

        <div className="admin-dashboard-layout">
          <aside className={`admin-sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
            <div className="admin-sidebar-brand">
              <div className="admin-sidebar-brand-copy">
                <span>PORTFOLIO</span>
                <strong>Admin Menu</strong>
              </div>
            </div>

            <nav aria-label="Admin sections">
              {sidebarMenuItems.map((item) => {
                const isActive = activeMenu === item.id;
                const newCount =
                  item.id === "inquiries"
                    ? contacts.filter((contact) => contact.status === "new").length
                    : 0;

                const handleClick = () => {
                  if (item.id === "portfolio") {
                    setIsSidebarOpen(false);
                    window.open("/", "_blank", "noopener,noreferrer");
                    return;
                  }

                  navigateToSection(item.id);
                };

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={isActive ? "active" : ""}
                    onClick={handleClick}
                    aria-label={item.label}
                    title={item.label}
                  >
                    <span className="admin-nav-icon" aria-hidden="true">
                      <SidebarIcon name={item.icon} />
                    </span>

                    <span className="admin-nav-label">{item.label}</span>
                    {newCount > 0 && <b>{newCount}</b>}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="admin-dashboard-content">

        {/* ======================================================
            MESSAGES
        ====================================================== */}

        {message && (
          <div className="admin-message success">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-message error">
            {error}
          </div>
        )}

        <section id="overview" className={getSectionClassName("overview", "admin-card overview-card")}>
          <div className="admin-card-header">
            <div>
              <span>OVERVIEW</span>
              <h2>Dashboard Summary</h2>
              <p>Quick access to your portfolio performance and content.</p>
            </div>
          </div>

          <div className="overview-grid">
            {overviewStats.map((stat) => (
              <div className="overview-stat" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className={getSectionClassName("services", "admin-card service-manager-card")}>
          <div className="admin-card-header">
            <div>
              <span>SERVICES</span>
              <h2>Manage service offerings</h2>
              <p>Update the services displayed on your public site.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label htmlFor="service-title">Service Title</label>
              <input
                id="service-title"
                name="title"
                type="text"
                value={serviceForm.title}
                onChange={handleServiceFormChange}
                placeholder="Brand Identity"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="service-description">Description</label>
              <textarea
                id="service-description"
                name="description"
                rows="4"
                value={serviceForm.description}
                onChange={handleServiceFormChange}
                placeholder="Explain what this service includes."
              />
            </div>
          </div>

          <div className="admin-inline-actions">
            <button type="button" className="project-submit" onClick={saveService}>
              {serviceForm.id ? "Update Service" : "Add Service"}
            </button>
          </div>

          <div className="admin-list-grid">
            {services.map((service) => (
              <article className="admin-list-item" key={service.id}>
                <div>
                  <strong>{service.title}</strong>
                  <p>{service.description}</p>
                </div>
                <div className="list-actions">
                  <button type="button" onClick={() => editService(service)}>Edit</button>
                  <button type="button" className="danger" onClick={() => deleteService(service.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className={getSectionClassName("skills", "admin-card skill-manager-card")}>
          <div className="admin-card-header">
            <div>
              <span>SKILLS</span>
              <h2>Manage technology and creative skill set</h2>
              <p>Keep your portfolio skills current and visible to visitors.</p>
            </div>
          </div>

          <div className="admin-inline-form">
            <input
              type="text"
              value={skillInput}
              onChange={(event) => setSkillInput(event.target.value)}
              placeholder="Add a skill"
            />
            <button type="button" className="project-submit" onClick={addSkill}>Add Skill</button>
          </div>

          <div className="chip-list">
            {skills.map((skill) => (
              <span className="chip" key={skill}>
                {skill}
                <button type="button" onClick={() => deleteSkill(skill)} aria-label={`Remove ${skill}`}>
                  Ã—
                </button>
              </span>
            ))}
          </div>
        </section>

        <section id="testimonials" className={getSectionClassName("testimonials", "admin-card testimonial-manager-card")}>
          <div className="admin-card-header">
            <div>
              <span>TESTIMONIALS</span>
              <h2>Client feedback</h2>
              <p>Add review cards that help build trust with new clients.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label htmlFor="testimonial-name">Client Name</label>
              <input
                id="testimonial-name"
                name="name"
                type="text"
                value={testimonialForm.name}
                onChange={handleTestimonialFormChange}
                placeholder="Jane Doe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="testimonial-role">Role</label>
              <input
                id="testimonial-role"
                name="role"
                type="text"
                value={testimonialForm.role}
                onChange={handleTestimonialFormChange}
                placeholder="Marketing Lead"
              />
            </div>

            <div className="form-group">
              <label htmlFor="testimonial-rating">Rating</label>
              <select
                id="testimonial-rating"
                name="rating"
                value={testimonialForm.rating}
                onChange={handleTestimonialFormChange}
              >
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="testimonial-quote">Testimonial</label>
              <textarea
                id="testimonial-quote"
                name="quote"
                rows="4"
                value={testimonialForm.quote}
                onChange={handleTestimonialFormChange}
                placeholder="Share a short testimonial from a previous client."
              />
            </div>
          </div>

          <div className="admin-inline-actions">
            <button type="button" className="project-submit" onClick={saveTestimonial}>
              {testimonialForm.id ? "Update Testimonial" : "Add Testimonial"}
            </button>
          </div>

          <div className="admin-list-grid cards-grid">
            {testimonials.map((testimonial) => (
              <article className="admin-list-item testimonial-item" key={testimonial.id}>
                <p>â€œ{testimonial.quote}â€</p>
                <span className="admin-testimonial-rating" aria-label={`${testimonial.rating || 5} out of 5 stars`}>
                  {"★".repeat(testimonial.rating || 5)}
                </span>
                <strong>{testimonial.name}</strong>
                <small>{testimonial.role}</small>
                <div className="list-actions">
                  <button type="button" onClick={() => editTestimonial(testimonial)}>Edit</button>
                  <button type="button" className="danger" onClick={() => deleteTestimonial(testimonial.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="blog" className={getSectionClassName("blog", "admin-card blog-manager-card")}>
          <div className="admin-card-header">
            <div>
              <span>BLOG</span>
              <h2>Insights and updates</h2>
              <p>Create short articles and thought-leadership pieces for the public portfolio.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label htmlFor="blog-title">Article Title</label>
              <input
                id="blog-title"
                name="title"
                type="text"
                value={blogForm.title}
                onChange={handleBlogFormChange}
                placeholder="What makes a portfolio convert?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="blog-category">Category</label>
              <input
                id="blog-category"
                name="category"
                type="text"
                value={blogForm.category}
                onChange={handleBlogFormChange}
                placeholder="Brand Strategy"
              />
            </div>

            <div className="form-group">
              <label htmlFor="blog-read-time">Read Time</label>
              <input
                id="blog-read-time"
                name="readTime"
                type="text"
                value={blogForm.readTime}
                onChange={handleBlogFormChange}
                placeholder="4 min read"
              />
            </div>

            <div className="form-group">
              <label htmlFor="blog-date">Publish Date</label>
              <input
                id="blog-date"
                name="date"
                type="date"
                value={blogForm.date}
                onChange={handleBlogFormChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="blog-excerpt">Excerpt</label>
              <textarea
                id="blog-excerpt"
                name="excerpt"
                rows="3"
                value={blogForm.excerpt}
                onChange={handleBlogFormChange}
                placeholder="Write a short summary to preview on the portfolio page."
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="blog-content">Article Content</label>
              <textarea
                id="blog-content"
                name="content"
                rows="6"
                value={blogForm.content}
                onChange={handleBlogFormChange}
                placeholder="Add the main article content here."
              />
            </div>
          </div>

          <div className="admin-inline-actions">
            <button type="button" className="project-submit" onClick={saveBlogPost}>
              {blogForm.id ? "Update Post" : "Add Post"}
            </button>
          </div>

          <div className="admin-list-grid cards-grid">
            {blogPosts.map((post) => (
              <article className="admin-list-item testimonial-item" key={post.id}>
                <p className="blog-meta">{post.category} Â· {post.readTime} Â· {post.date}</p>
                <strong>{post.title}</strong>
                <small>{post.excerpt}</small>
                <div className="list-actions">
                  <button type="button" onClick={() => editBlogPost(post)}>Edit</button>
                  <button type="button" className="danger" onClick={() => deleteBlogPost(post.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="settings" className={getSectionClassName("settings", "admin-card settings-card")}>
          <div className="admin-card-header">
            <div>
              <span>SETTINGS</span>
              <h2>Site Settings</h2>
              <p>Update the core text that appears on the portfolio homepage.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="form-group">
              <label htmlFor="brand-name">Brand Name</label>
              <input
                id="brand-name"
                type="text"
                value={siteSettings.brandName}
                onChange={(event) =>
                  setSiteSettings((current) => ({
                    ...current,
                    brandName: event.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="site-title">Site Title</label>
              <input
                id="site-title"
                type="text"
                value={siteSettings.title}
                onChange={(event) =>
                  setSiteSettings((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="hero-title">Hero Title</label>
              <input
                id="hero-title"
                type="text"
                value={siteSettings.heroTitle}
                onChange={(event) =>
                  setSiteSettings((current) => ({
                    ...current,
                    heroTitle: event.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="hero-description">Hero Description</label>
              <textarea
                id="hero-description"
                rows="4"
                value={siteSettings.heroDescription}
                onChange={(event) =>
                  setSiteSettings((current) => ({
                    ...current,
                    heroDescription: event.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="site-email">Email</label>
              <input
                id="site-email"
                type="email"
                value={siteSettings.email}
                onChange={(event) =>
                  setSiteSettings((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="site-phone">Phone</label>
              <input
                id="site-phone"
                type="text"
                value={siteSettings.phone}
                onChange={(event) =>
                  setSiteSettings((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group full-width">
              <label>Website Access</label>
              <div className="website-toggle-row">
                <span className={`website-status-badge ${siteSettings.websiteEnabled ? "enabled" : "disabled"}`}>
                  {siteSettings.websiteEnabled ? "Enabled" : "Disabled"}
                </span>
                <button
                  type="button"
                  className={`website-toggle-button ${siteSettings.websiteEnabled ? "enabled" : "disabled"}`}
                  onClick={() => toggleWebsiteStatus(!siteSettings.websiteEnabled)}
                >
                  {siteSettings.websiteEnabled ? "Disable Website" : "Enable Website"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="media" className={getSectionClassName("media", "admin-card media-card")}>
          <div className="admin-card-header">
            <div>
              <span>MEDIA</span>
              <h2>Media library</h2>
              <p>Store visual assets for your portfolio and campaigns.</p>
            </div>
          </div>

          <div className="media-upload-row">
            <input type="file" accept="image/*" onChange={handleMediaUpload} />
          </div>

          {mediaMessage && <div className="admin-message success">{mediaMessage}</div>}

          <div className="media-grid">
            {mediaItems.length === 0 ? (
              <div className="inquiries-empty">No media uploaded yet.</div>
            ) : (
              mediaItems.map((item) => (
                <div className="media-item" key={item.id}>
                  <img src={item.url} alt={item.name} />
                  <div className="media-item-footer">
                    <span>{item.name}</span>
                    <button type="button" className="danger" onClick={() => deleteMediaItem(item.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section id="analytics" className={getSectionClassName("analytics", "admin-card analytics-card")}>
          <div className="admin-card-header">
            <div>
              <span>ANALYTICS</span>
              <h2>Performance snapshot</h2>
              <p>Monitor the health of your portfolio content at a glance.</p>
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-stat">
              <span>Views</span>
              <strong>{analytics.totalViews}</strong>
            </div>
            <div className="overview-stat">
              <span>Leads</span>
              <strong>{analytics.leads}</strong>
            </div>
            <div className="overview-stat">
              <span>Project Views</span>
              <strong>{analytics.projectViews}</strong>
            </div>
            <div className="overview-stat">
              <span>Article Views</span>
              <strong>{analytics.blogViews}</strong>
            </div>
          </div>

          <div className="analytics-detail-grid">
            <div className="analytics-list">
              <h3>Top projects</h3>
              {analytics.topProjects.length === 0 ? (
                <p className="analytics-muted">No project views recorded yet.</p>
              ) : (
                analytics.topProjects.map((item) => (
                  <div className="analytics-list-row" key={item._id}>
                    <span>{item.title || "Untitled project"}</span>
                    <strong>{item.views}</strong>
                  </div>
                ))
              )}
            </div>

            <div className="analytics-list">
              <h3>Top articles</h3>
              {analytics.topPosts.length === 0 ? (
                <p className="analytics-muted">No article views recorded yet.</p>
              ) : (
                analytics.topPosts.map((item) => (
                  <div className="analytics-list-row" key={item._id}>
                    <span>{item.title || "Untitled article"}</span>
                    <strong>{item.views}</strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section id="security" className={getSectionClassName("security", "admin-card security-card")}>
          <div className="admin-card-header">
            <div>
              <span>SECURITY</span>
              <h2>Update admin access</h2>
              <p>Change the local admin login credentials used to protect the dashboard.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate} className="admin-form-grid">
            <div className="form-group">
              <label htmlFor="security-email">Admin Email</label>
              <input id="security-email" name="email" type="email" placeholder="admin@portfolio.com" />
            </div>
            <div className="form-group">
              <label htmlFor="security-password">New Password</label>
              <input id="security-password" name="password" type="password" placeholder="Enter new password" />
            </div>
            <div className="form-group full-width">
              <label htmlFor="security-confirm-password">Confirm Password</label>
              <input id="security-confirm-password" name="confirmPassword" type="password" placeholder="Repeat your new password" />
            </div>
            <div className="admin-inline-actions">
              <button type="submit" className="project-submit">Update Credentials</button>
            </div>
          </form>
        </section>

        <section id="profile" className={getSectionClassName("profile", "admin-card profile-settings-card")}>

          <div className="admin-card-header">
            <div>
              <span>
                PROFILE
              </span>

              <h2>
                Profile Picture
              </h2>

              <p>
                This picture will appear on your
                portfolio homepage.
              </p>
            </div>
          </div>

          <div className="profile-image-manager">

            {/* PROFILE PREVIEW */}

            <div className="profile-image-preview">

              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile preview"
                />
              ) : (
                <div className="profile-image-placeholder">
                  <span>+</span>

                  <small>
                    No profile picture
                  </small>
                </div>
              )}

            </div>

            {/* PROFILE CONTROLS */}

            <div className="profile-image-controls">

              <h3>
                Portfolio Profile Picture
              </h3>

              <p>
                Upload a professional photo to
                display on your Home page.
              </p>

              <input
                ref={profileImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={
                  handleProfileImageChange
                }
              />

              {profileImageFile && (
                <div className="profile-selected-file">

                  <strong>
                    {profileImageFile.name}
                  </strong>

                  <span>
                    {formatFileSize(
                      profileImageFile.size
                    )}
                  </span>

                </div>
              )}

              <div className="profile-image-actions">

                <button
                  type="button"
                  className="profile-upload-button"
                  onClick={
                    handleProfileImageUpload
                  }
                  disabled={
                    profileImageLoading ||
                    !profileImageFile
                  }
                >
                  {profileImageLoading
                    ? "Saving..."
                    : profileImage
                    ? "Replace Picture"
                    : "Upload Picture"}
                </button>

                {profileImage && (
                  <button
                    type="button"
                    className="profile-remove-button"
                    onClick={
                      handleRemoveProfileImage
                    }
                    disabled={
                      profileImageLoading
                    }
                  >
                    Remove Picture
                  </button>
                )}

              </div>

              <small className="profile-image-help">
                JPG, PNG, WEBP or GIF.
                Maximum 10MB.
              </small>

            </div>

          </div>

          <div className="cv-upload-manager">
            <div>
              <span className="cv-upload-eyebrow">RESUME</span>
              <h3>Curriculum Vitae</h3>
              <p>Upload the CV visitors can download from your portfolio.</p>
            </div>

            {cvUrl && (
              <a
                className="cv-current-link"
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {cvName || "View current CV"}
              </a>
            )}

            <input
              ref={cvInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleCvChange}
            />

            {cvFile && (
              <div className="profile-selected-file">
                <strong>{cvFile.name}</strong>
                <span>{formatFileSize(cvFile.size)}</span>
              </div>
            )}

            <div className="cv-upload-actions">
              <button
                type="button"
                className="profile-upload-button"
                onClick={handleCvUpload}
                disabled={cvLoading || !cvFile}
              >
                {cvLoading ? "Saving..." : cvUrl ? "Replace CV" : "Upload CV"}
              </button>

              {cvUrl && (
                <button
                  type="button"
                  className="profile-remove-button"
                  onClick={handleRemoveCv}
                  disabled={cvLoading}
                >
                  Remove CV
                </button>
              )}
            </div>

            <small className="profile-image-help">
              PDF, DOC or DOCX. Maximum 10MB.
            </small>
          </div>

          <div className="admin-form-grid profile-fields">
            <div className="form-group">
              <label htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                name="name"
                type="text"
                value={profileForm.name}
                onChange={handleProfileFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-title">Professional Title</label>
              <input
                id="profile-title"
                name="title"
                type="text"
                value={profileForm.title}
                onChange={handleProfileFormChange}
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="profile-bio">Bio</label>
              <textarea
                id="profile-bio"
                name="bio"
                rows="4"
                value={profileForm.bio}
                onChange={handleProfileFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-location">Location</label>
              <input
                id="profile-location"
                name="location"
                type="text"
                value={profileForm.location}
                onChange={handleProfileFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-instagram">Instagram</label>
              <input
                id="profile-instagram"
                name="instagram"
                type="url"
                value={profileForm.instagram}
                onChange={handleProfileFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-linkedin">LinkedIn</label>
              <input
                id="profile-linkedin"
                name="linkedin"
                type="url"
                value={profileForm.linkedin}
                onChange={handleProfileFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-behance">Behance</label>
              <input
                id="profile-behance"
                name="behance"
                type="url"
                value={profileForm.behance}
                onChange={handleProfileFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-github">GitHub</label>
              <input
                id="profile-github"
                name="github"
                type="url"
                value={profileForm.github}
                onChange={handleProfileFormChange}
              />
            </div>
          </div>

          <div className="admin-inline-actions">
            <button type="button" className="project-submit" onClick={saveProfileDetails}>Save profile details</button>
          </div>

        </section>

        {/* ======================================================
            CONTACT INQUIRIES
        ====================================================== */}

        <section id="inquiries" className={getSectionClassName("inquiries", "admin-card inquiries-card")}>
          <div className="admin-card-header">
            <div>
              <span>INBOX</span>
              <h2>Project Inquiries</h2>
              <p>Review and manage messages from potential clients.</p>
            </div>

            <strong className="inquiries-count">
              {contacts.filter((contact) => contact.status === "new").length}{" "}
              New
            </strong>
          </div>

          {contactsLoading ? (
            <div className="inquiries-empty">Loading inquiries...</div>
          ) : contacts.length === 0 ? (
            <div className="inquiries-empty">
              No project inquiries yet.
            </div>
          ) : (
            <div className="inquiries-list">
              {contacts.map((contact) => (
                <article className="inquiry-item" key={contact._id}>
                  <div className="inquiry-item-header">
                    <div>
                      <h3>{contact.name}</h3>
                      <a href={`mailto:${contact.email}`}>
                        {contact.email}
                      </a>
                    </div>

                    <select
                      value={contact.status}
                      onChange={(event) =>
                        updateContactStatus(
                          contact._id,
                          event.target.value
                        )
                      }
                      aria-label={`Status for ${contact.name}`}
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="inquiry-meta">
                    <span>{contact.service}</span>
                    <span>{contact.budget}</span>
                    <time dateTime={contact.createdAt}>
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </time>
                  </div>

                  <p className="inquiry-message">{contact.message}</p>

                  <button
                    type="button"
                    className="inquiry-delete"
                    onClick={() => deleteContact(contact._id)}
                  >
                    Delete inquiry
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ======================================================
            PROJECT FORM
        ====================================================== */}

        <section className={getSectionClassName("projects", "admin-card project-form-card")}>

          <div className="admin-card-header">

            <div>
              <span>
                {editingId
                  ? "EDIT PROJECT"
                  : "ADD PROJECT"}
              </span>

              <h2>
                {editingId
                  ? "Update your project"
                  : "Add a new project"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                className="cancel-edit"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}

          </div>

          <form
            className="project-form"
            onSubmit={handleSubmit}
          >

            {/* TITLE */}

            <div className="form-group">

              <label htmlFor="title">
                Project Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Dominion Winners"
                value={form.title}
                onChange={handleChange}
                required
              />

            </div>

            {/* DESCRIPTION */}

            <div className="form-group">

              <label htmlFor="description">
                Project Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="5"
                placeholder="Describe what you built..."
                value={form.description}
                onChange={handleChange}
                required
              />

            </div>

            {/* CASE STUDY DETAILS */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clientType">Client / Industry</label>
                <input id="clientType" name="clientType" type="text" value={form.clientType} onChange={handleChange} placeholder="e.g. Fintech startup" />
              </div>
              <div className="form-group">
                <label htmlFor="results">Results</label>
                <input id="results" name="results" type="text" value={form.results} onChange={handleChange} placeholder="e.g. 42% more enquiries" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="challenge">Challenge</label>
                <textarea id="challenge" name="challenge" rows="3" value={form.challenge} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="solution">Solution</label>
                <textarea id="solution" name="solution" rows="3" value={form.solution} onChange={handleChange} />
              </div>
            </div>

            {/* CATEGORY + TECHNOLOGIES */}

            <div className="form-row">

              <div className="form-group">

                <label htmlFor="category">
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select category
                  </option>

                  <option value="Web Development">
                    Web Development
                  </option>

                  <option value="Graphic Design">
                    Graphic Design
                  </option>

                  <option value="Branding">
                    Branding
                  </option>

                  <option value="Digital Marketing">
                    Digital Marketing
                  </option>

                  <option value="Mobile Development">
                    Mobile Development
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

              </div>

              <div className="form-group">

                <label htmlFor="technologies">
                  Technologies
                </label>

                <div
                  id="technologies"
                  className="technology-checkbox-list"
                  role="group"
                  aria-label="Project technologies"
                >
                  {TECHNOLOGY_OPTIONS.map((technology) => {
                    const isSelected =
                      form.technologies.includes(technology);

                    return (
                      <label
                        key={technology}
                        className={`technology-option ${
                          isSelected ? "selected" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="technologies"
                          checked={isSelected}
                          onChange={() =>
                            handleTechnologyToggle(technology)
                          }
                        />
                        <span>{technology}</span>
                      </label>
                    );
                  })}
                </div>

                <small>
                  Select all relevant technologies for this project.
                </small>

              </div>

            </div>

            {/* PROJECT IMAGE */}

            <div className="form-group">

              <label htmlFor="image">
                Project Image
              </label>

              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleProjectImageChange}
              />

              {form.image && (
                <div className="project-image-preview-box">
                  <img src={form.image} alt="Project preview" />
                </div>
              )}

              <small>
                Upload a project preview image.
                JPG, PNG, WEBP or GIF.
              </small>

            </div>

            {/* LIVE PROJECT + GITHUB */}

            <div className="form-row">

              <div className="form-group">

                <label htmlFor="liveUrl">
                  Live Project URL
                </label>

                <input
                  id="liveUrl"
                  name="liveUrl"
                  type="url"
                  placeholder="https://..."
                  value={form.liveUrl}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="githubUrl">
                  GitHub URL
                </label>

                <input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  placeholder="https://github.com/..."
                  value={form.githubUrl}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* PROJECT FILE UPLOADER */}

            <div className="project-upload-group">

              <label htmlFor="projectFiles">
                Project Files
              </label>

              <input
                ref={fileInputRef}
                id="projectFiles"
                name="projectFiles"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.zip,.rar,.txt,.doc,.docx,.ppt,.pptx"
                onChange={handleFileChange}
              />

              <p className="project-upload-help">
                Upload files visitors can download.
                You can select multiple files.
                Maximum 10 files per upload.
              </p>

              {projectFiles.length > 0 && (
                <div className="selected-project-files">

                  <h4>
                    Files to Upload
                  </h4>

                  {projectFiles.map(
                    (file, index) => (
                      <div
                        className="selected-project-file"
                        key={`${file.name}-${index}`}
                      >

                        <div>

                          <strong>
                            {file.name}
                          </strong>

                          <span>
                            {formatFileSize(
                              file.size
                            )}
                          </span>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeSelectedFile(
                              index
                            )
                          }
                        >
                          Remove
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* OPTIONS */}

            <div className="project-options">

              <label className="checkbox-option">

                <input
                  type="checkbox"
                  name="featured"
                  checked={
                    form.featured
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>

                  <strong>
                    Featured Project
                  </strong>

                  <small>
                    Highlight this project
                    on your portfolio.
                  </small>

                </span>

              </label>

              <label className="checkbox-option">

                <input
                  type="checkbox"
                  name="published"
                  checked={
                    form.published
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>

                  <strong>
                    Published
                  </strong>

                  <small>
                    Make this project
                    visible to visitors.
                  </small>

                </span>

              </label>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="project-submit"
              disabled={loading}
            >
              {loading
                ? editingId
                  ? "Updating Project..."
                  : "Uploading Project..."
                : editingId
                ? "Update Project"
                : "Add Project"}
            </button>

          </form>

        </section>

        {/* ======================================================
            PROJECT LIST
        ====================================================== */}

        <section id="projects" className={getSectionClassName("projects", "projects-management")}>

          <div className="projects-management-header">

            <div>

              <span>
                YOUR PROJECTS
              </span>

              <h2>
                Manage Portfolio
              </h2>

            </div>

            <strong>
              {projects.length}{" "}
              {projects.length === 1
                ? "Project"
                : "Projects"}
            </strong>

          </div>

          {projectsLoading ? (
            <div className="projects-loading">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="projects-empty">

              <h3>
                No projects yet
              </h3>

              <p>
                Add your first project using
                the form above.
              </p>

            </div>
          ) : (
            <div className="admin-project-grid">

              {projects.map(
                (project) => (
                  <article
                    className="admin-project-card"
                    key={project._id}
                  >

                    {/* PROJECT IMAGE */}

                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="admin-project-image"
                      />
                    ) : (
                      <div className="admin-project-placeholder">
                        No Image
                      </div>
                    )}

                    <div className="admin-project-content">

                      {/* STATUS */}

                      <div className="admin-project-status">

                        <span>
                          {project.category}
                        </span>

                        <span
                          className={
                            project.published
                              ? "status-published"
                              : "status-hidden"
                          }
                        >
                          {project.published
                            ? "Published"
                            : "Hidden"}
                        </span>

                      </div>

                      {/* TITLE */}

                      <h3>
                        {project.title}
                      </h3>

                      {/* DESCRIPTION */}

                      <p>
                        {project.description}
                      </p>

                      {/* TECHNOLOGIES */}

                      {project.technologies?.length > 0 && (
                        <div className="technology-list">

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

                      {/* PROJECT LINKS */}

                      {(project.liveUrl ||
                        project.githubUrl) && (
                        <div className="admin-project-links">

                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="project-link"
                            >
                              Live Project
                            </a>
                          )}

                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="project-link"
                            >
                              GitHub
                            </a>
                          )}

                        </div>
                      )}

                      {/* UPLOADED FILES */}

                      <div className="admin-project-files">

                        <h4>
                          Downloadable Files
                        </h4>

                        {project.files?.length > 0 ? (
                          <div className="admin-file-list">

                            {project.files.map(
                              (file) => (
                                <div
                                  className="admin-file-item"
                                  key={
                                    file._id ||
                                    file.publicId ||
                                    file.url
                                  }
                                >

                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="admin-file-download"
                                  >

                                    <span>
                                      {file.name}
                                    </span>

                                    <small>
                                      {formatFileSize(
                                        file.size
                                      )}
                                    </small>

                                    <strong>
                                      Download
                                    </strong>

                                  </a>

                                  {file._id && (
                                    <button
                                      type="button"
                                      className="remove-file-button"
                                      onClick={() =>
                                        handleDeleteExistingFile(
                                          project._id,
                                          file._id,
                                          file.name
                                        )
                                      }
                                    >
                                      Remove
                                    </button>
                                  )}

                                </div>
                              )
                            )}

                          </div>
                        ) : (
                          <div className="no-project-files">
                            No downloadable files.
                          </div>
                        )}

                      </div>

                      {/* ACTIONS */}

                      <div className="admin-project-actions">

                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            handleEdit(
                              project
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              project._id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </section>

          </div>
        </div>

      </div>
    </main>
  );
}

export default AdminDashboard;
