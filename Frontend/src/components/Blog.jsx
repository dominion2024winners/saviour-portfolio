import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../utils/i18n";

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const defaultPosts = [
  {
    id: "blog-1",
    title: "What makes a portfolio actually convert?",
    category: "Brand Strategy",
    date: "2026-09-10",
    readTime: "4 min read",
    excerpt:
      "A portfolio is more than a gallery of work. It is a trust-building system that helps the right clients say yes sooner.",
    content:
      "A good portfolio speaks to the problem a client is trying to solve and clearly explains how your process leads to outcomes. Clarity, consistency and evidence do far more than decoration.",
  },
  {
    id: "blog-2",
    title: "How clear positioning improves client response",
    category: "Digital Presence",
    date: "2026-08-22",
    readTime: "3 min read",
    excerpt:
      "When positioning is clear, potential clients understand your value before the first conversation even starts.",
    content:
      "Strong positioning helps people quickly understand the kind of work you do, the kind of clients you serve and why your approach is different. It reduces friction and attracts better-fit opportunities.",
  },
];

function Blog() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState(() =>
    readStorage("portfolioBlogPosts", defaultPosts)
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      const storedPosts = readStorage("portfolioBlogPosts", defaultPosts);

      try {
        const response = await fetch(`${API_URL}/api/blog`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load blog posts.");
        }

        if (isMounted) {
          setPosts(data.posts?.length > 0 ? data.posts : storedPosts);
        }
      } catch (error) {
        console.warn("Load public blog posts error:", error);

        if (isMounted) {
          setPosts(storedPosts);
        }
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = ["All", ...new Set(posts.map((post) => post.category).filter(Boolean))];
  const filteredPosts = posts.filter((post) => {
    const searchable = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase();
    return (
      (category === "All" || post.category === category) &&
      (!query.trim() || searchable.includes(query.trim().toLowerCase()))
    );
  });

  return (
    <section id="blog" className="section blog-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">INSIGHTS</span>
          <h2 className="section-title">
            Latest <span>Articles.</span>
          </h2>
          <p className="section-description">
            Perspective, process and practical ideas for building a stronger digital presence.
          </p>
        </div>

        <div className="blog-filters" aria-label="Article filters">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchArticles")}
            aria-label="Search articles"
          />
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="blog-empty">No articles published yet.</div>
        ) : (
          <div className="blog-grid">
            {filteredPosts.map((post) => (
              <article className="blog-card" key={post.id}>
                <div className="blog-card-top">
                  <span className="blog-category">{post.category}</span>
                  <span className="blog-read-time">{post.readTime}</span>
                </div>

                <h3>{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>

                <div className="blog-card-footer">
                  <span>{post.date}</span>
                  <Link to={`/blog/${post.id}`} className="blog-link">
                    {t("readMore")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Blog;
