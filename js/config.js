(function configureResume() {
  const productionApiBaseUrl =
    "https://resume-backend-henna.vercel.app/api/v1";
  const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const configured =
    window.RESUME_API_BASE_URL ||
    (isLocal ? "http://localhost:3000/api/v1" : productionApiBaseUrl);

  window.RESUME_CONFIG = Object.freeze({
    API_BASE_URL:
      configured && !configured.includes("CHANGE-ME")
        ? configured.replace(/\/$/, "")
        : "",
    FALLBACK_URL: "/data/resume.json",
    REQUEST_TIMEOUT_MS: 8000,
  });
})();
