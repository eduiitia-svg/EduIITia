import { ChevronRight, Moon, Sun } from "lucide-react";
import React from "react";

function TestNav({
  formatTime,
  handleSubmitTest,
  isSubmitting,
  currentTest,
  showSuccessPopup,
  testName,
  timeLeft,
  showPdfSidebar,
  setShowPdfSidebar,
  isDarkMode,
  setIsDarkMode,
}) {
  const safeFormatTime = (seconds) => {
    if (typeof formatTime === "function") {
      return formatTime(seconds);
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <nav className="test-nav">
      <div className="nav-left">
        <h2 className="test-title">{testName || "Mock Test"}</h2>
      </div>

      <div className="nav-right">
        <div className="timer-container">
          <span className="timer-label">Time Remaining</span>
          <span className={`timer ${timeLeft < 300 ? "timer-warning" : ""}`}>
            {safeFormatTime(timeLeft)}
          </span>
        </div>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            background: "transparent",
            border: "1px solid var(--glass-border)",
            borderRadius: "8px",
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: "1.2rem",
            color: "var(--text-main)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = "var(--primary-accent)";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = "var(--glass-border)";
            e.target.style.transform = "scale(1)";
          }}
        >
          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button
          className="submit-test-btn"
          onClick={handleSubmitTest}
          disabled={isSubmitting || showSuccessPopup}
        >
          {isSubmitting
            ? "Submitting..."
            : showSuccessPopup
            ? "Test Submitted"
            : "Submit Test"}
        </button>

        <button
          onClick={() => setShowPdfSidebar(!showPdfSidebar)}
          className="pdf-toggle-btn"
          title="View Questions PDF"
        >
          <ChevronRight
            className="pdf-toggle-icon"
            style={{
              transform: showPdfSidebar ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </button>
      </div>
    </nav>
  );
}

export default TestNav;
