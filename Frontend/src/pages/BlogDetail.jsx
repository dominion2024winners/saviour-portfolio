import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./BlogDetail.css";
import { trackAnalyticsEvent } from "../utils/analytics";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

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
      "A good portfolio speaks to the problem a client is trying to solve and clearly explains how your process leads to outcomes. Clarity, consistency and evidence do far more than decoration.\n\nWhen someone lands on your portfolio, they are deciding whether you understand their challenge and whether the visual direction feels credible. That means your work should show thinking, not just visuals. Pair your strongest examples with context: the business goal, the constraints, and the result.\n\nThis transforms a portfolio from a collection of images into a decision-making tool. It helps prospective clients understand the value of working with you before they ever reach out.",
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
      "Strong positioning helps people quickly understand the kind of work you do, the kind of clients you serve and why your approach is different. It reduces friction and attracts better-fit opportunities.\n\nA lot of businesses struggle because their portfolio looks polished but does not clearly explain what they stand for. The fix is usually not more decoration. It is sharper messaging, more specific examples, and a clearer narrative around the work.\n\nOnce the offer is easier to understand, conversations become more focused and the right clients feel more confident reaching out.",
  },
];

function BlogDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadPost = async () => {
      try {
        const response = await fetch(`${API_URL}/api/blog/${postId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load blog post.");
        }

        if (isMounted) {
          setPost(data.post || null);
          if (data.post) {
            trackAnalyticsEvent({
              type: "blog_view",
              path: `/blog/${postId}`,
              contentId: data.post._id || postId,
              contentTitle: data.post.title,
            });
          }
        }
      } catch (error) {
        console.warn("Load blog detail error:", error);
        const posts = readStorage("portfolioBlogPosts", defaultPosts);
        const fallbackPost =
          posts.find((item) => item.id === postId) ||
          defaultPosts.find((item) => item.id === postId) ||
          null;

        if (isMounted) {
          setPost(fallbackPost);
          if (fallbackPost) {
            trackAnalyticsEvent({
              type: "blog_view",
              path: `/blog/${postId}`,
              contentId: fallbackPost._id || postId,
              contentTitle: fallbackPost.title,
            });
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  if (loading) {
    return (
      <main className="blog-detail-page">
        <div className="blog-detail-empty">Loading article…</div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="blog-detail-page">
        <div className="blog-detail-empty">
          <span className="blog-detail-tag">ARTICLE</span>
          <h1>Article not found</h1>
          <p>This story is unavailable right now.</p>
          <Link to="/" className="blog-detail-back-link">
            Back to portfolio
          </Link>
        </div>
      </main>
    );
  }

  const paragraphs = post.content.split("\n\n");

  return (
    <main className="blog-detail-page">
      <div className="blog-detail-shell">
        <Link to="/" className="blog-detail-back-link">
          ← Back to portfolio
        </Link>

        <article className="blog-detail-card">
          <div className="blog-detail-header">
            <span className="blog-detail-tag">{post.category}</span>
            <div className="blog-detail-meta">
              <span>{post.date}</span>
              <span>{post.readTime}</span>
            </div>
          </div>

          <h1>{post.title}</h1>
          <p className="blog-detail-excerpt">{post.excerpt}</p>

          <div className="blog-detail-content">
            {paragraphs.map((paragraph, index) => (
              <p key={`${post.id}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}

export default BlogDetail;
