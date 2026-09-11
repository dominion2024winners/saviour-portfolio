const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const trackAnalyticsEvent = (event) => {
  fetch(`${API_URL}/api/analytics/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch((error) => {
    console.warn("Analytics event could not be recorded.", error);
  });
};
