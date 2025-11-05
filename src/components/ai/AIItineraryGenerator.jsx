import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import TopBar from "../layout/Topbar/Topbar";
import Header from "../layout/Header/Header";
import Footer from "../layout/Footer/Footer";
import {
  generateAIItinerary,
  PREFERENCE_OPTIONS,
  BUDGET_OPTIONS,
} from "../../services/aiItineraryService";
import NewItineraryView from "./NewItineraryView";
import "./AIItinerary.css";

const AIItineraryGenerator = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    destination: "",
    participants: 1,
    ageRange: "",
    duration_days: 3,
    budget_level: "medium",
    preferences: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error("Please login to use AI Itinerary Generator");
      setTimeout(() => navigate("/auth"), 2000);
      return;
    }
  }, [user, authLoading, navigate]);

  const handlePreferenceToggle = (prefId) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(prefId)
        ? prev.preferences.filter((p) => p !== prefId)
        : [...prev.preferences, prefId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Enhanced validation based on new API spec
    if (!formData.destination.trim()) {
      toast.error("Please enter a destination.");
      return;
    }
    if (formData.destination.trim().length < 2) {
      toast.error("Please enter a valid destination (at least 2 characters).");
      return;
    }
    if (formData.preferences.length < 2) {
      toast.error(
        "Please select at least 2 preferences for better personalization."
      );
      return;
    }
    if (formData.participants < 1) {
      toast.error("Number of travelers must be at least 1.");
      return;
    }

    setLoading(true);

    const messages = [
      "🤖 AI analyzing your preferences...",
      "🗺️ Finding perfect destinations...",
      "⏰ Optimizing your schedule...",
      "💡 Adding personalized touches...",
      "✨ Almost ready...",
    ];

    let messageIndex = 0;
    setLoadingMessage(messages[0]);

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 1500);

    try {
      // Build request data according to new API spec
      const requestData = {
        destination: formData.destination.trim(),
        duration_days: formData.duration_days,
        participant_number: formData.participants,
        budget_level: formData.budget_level,
        preferences: formData.preferences,
      };

      // Add optional fields if provided
      if (formData.ageRange && formData.ageRange.trim()) {
        requestData.age_range = formData.ageRange.trim();
      }

      console.log("📤 Sending AI Itinerary Request:", requestData);

      const response = await generateAIItinerary(requestData);

      if (response.success && response.data) {
        setResult(response.data);
        toast.success(response.message || "Perfect itinerary generated! 🎉");

        // Navigate to detail view after successful generation
        if (response.data.aiGeneratedId) {
          setTimeout(() => {
            navigate(`/ai-itinerary/${response.data.aiGeneratedId}`);
          }, 2000);
        }
      } else {
        throw new Error(response.message || "Failed to generate itinerary");
      }
    } catch (err) {
      console.error("❌ Generation Error:", err);
      const errorMessage =
        err.message || "Failed to generate itinerary. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      clearInterval(messageInterval);
      setLoading(false);
      setLoadingMessage("");
    }
  };

  if (authLoading || !user) {
    return (
      <>
        <TopBar />
        <Header />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              backgroundColor: "white",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              borderRadius: "1rem",
            }}
          >
            {authLoading ? (
              <div style={{ color: "#666" }}>Loading authentication...</div>
            ) : (
              <>
                <p style={{ color: "#666", marginBottom: "1rem" }}>
                  Please login to use AI Itinerary Generator
                </p>
                <button
                  onClick={() => navigate("/auth")}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#14b8a6",
                    color: "white",
                    borderRadius: "0.5rem",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                  }}
                >
                  Go to Login
                </button>
              </>
            )}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Use preference options from service
  const preferenceTags = PREFERENCE_OPTIONS;

  const styles = {
    heroSection: {
      background:
        "linear-gradient(135deg, #0d9488 0%, #06b6d4 50%, #3b82f6 100%)",
      padding: "4rem 1rem",
      paddingTop: "180px",
      position: "relative",
      overflow: "hidden",
    },
    heroContent: {
      maxWidth: "1200px",
      margin: "0 auto",
      textAlign: "center",
      position: "relative",
      zIndex: 10,
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      backgroundColor: "rgba(255,255,255,0.2)",
      backdropFilter: "blur(10px)",
      padding: "0.5rem 1rem",
      borderRadius: "9999px",
      marginBottom: "1.5rem",
      color: "white",
      fontSize: "0.875rem",
      fontWeight: "500",
    },
    mainTitle: {
      fontSize: "3.5rem",
      fontWeight: "700",
      color: "white",
      marginBottom: "1rem",
      lineHeight: "1.2",
    },
    gradientText: {
      background: "linear-gradient(135deg, #fde047 0%, #fb923c 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    subtitle: {
      fontSize: "1.25rem",
      color: "#bfdbfe",
      maxWidth: "800px",
      margin: "0 auto",
    },
    container: {
      maxWidth: "1200px",
      margin: "-2rem auto 3rem",
      padding: "0 1rem",
    },
    formCard: {
      backgroundColor: "white",
      borderRadius: "1.5rem",
      boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      overflow: "hidden",
    },
    progressBar: {
      background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
      padding: "1.5rem 2rem",
      borderBottom: "1px solid #e5e7eb",
    },
    formContent: {
      padding: "3rem",
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      marginBottom: "2rem",
    },
    iconBox: {
      width: "2.5rem",
      height: "2.5rem",
      borderRadius: "0.75rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    sectionTitle: {
      fontSize: "1.875rem",
      fontWeight: "700",
      color: "#111827",
      margin: 0,
    },
    label: {
      display: "block",
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#374151",
      marginBottom: "0.75rem",
    },
    input: {
      width: "100%",
      padding: "0.875rem 1rem",
      fontSize: "1rem",
      border: "2px solid #e5e7eb",
      borderRadius: "0.75rem",
      backgroundColor: "white",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      transition: "all 0.2s",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      padding: "0.875rem 1rem",
      fontSize: "1rem",
      border: "2px solid #e5e7eb",
      borderRadius: "0.75rem",
      backgroundColor: "white",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      transition: "all 0.2s",
      cursor: "pointer",
      boxSizing: "border-box",
    },
    counterContainer: {
      display: "flex",
      alignItems: "center",
      background: "linear-gradient(135deg, #f9fafb 0%, white 100%)",
      border: "2px solid #e5e7eb",
      borderRadius: "0.75rem",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      overflow: "hidden",
    },
    counterButton: {
      width: "3rem",
      height: "3.375rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "white",
      border: "none",
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#374151",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    counterValue: {
      flex: 1,
      textAlign: "center",
      fontSize: "1.25rem",
      fontWeight: "700",
      color: "#111827",
      backgroundColor: "white",
    },
    durationButton: (isActive) => ({
      padding: "0.75rem 1.5rem",
      fontSize: "0.875rem",
      fontWeight: "600",
      borderRadius: "0.75rem",
      border: isActive ? "none" : "2px solid #e5e7eb",
      background: isActive
        ? "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)"
        : "white",
      color: isActive ? "white" : "#374151",
      cursor: "pointer",
      transition: "all 0.2s",
      boxShadow: isActive
        ? "0 4px 6px rgba(20, 184, 166, 0.3)"
        : "0 2px 4px rgba(0,0,0,0.05)",
    }),
    budgetCard: (isActive, gradient) => ({
      position: "relative",
      padding: "1.5rem",
      borderRadius: "1rem",
      border: isActive ? "none" : "2px solid #e5e7eb",
      background: isActive ? gradient : "white",
      color: isActive ? "white" : "#111827",
      cursor: "pointer",
      transition: "all 0.3s",
      boxShadow: isActive
        ? "0 10px 20px rgba(0,0,0,0.15)"
        : "0 4px 6px rgba(0,0,0,0.05)",
      transform: isActive ? "scale(1.05)" : "scale(1)",
    }),
    preferenceButton: (isActive, gradient) => ({
      position: "relative",
      padding: "1.25rem",
      borderRadius: "1rem",
      border: isActive ? "none" : "2px solid #e5e7eb",
      background: isActive ? gradient : "white",
      color: isActive ? "white" : "#374151",
      cursor: "pointer",
      transition: "all 0.3s",
      boxShadow: isActive
        ? "0 8px 16px rgba(0,0,0,0.15)"
        : "0 4px 6px rgba(0,0,0,0.05)",
      transform: isActive ? "scale(1.05)" : "scale(1)",
      textAlign: "center",
      fontWeight: "700",
      fontSize: "0.875rem",
    }),
    submitButton: {
      width: "100%",
      padding: "1.25rem",
      background:
        "linear-gradient(135deg, #0d9488 0%, #06b6d4 50%, #3b82f6 100%)",
      color: "white",
      border: "none",
      borderRadius: "1rem",
      fontSize: "1.25rem",
      fontWeight: "700",
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.5 : 1,
      transition: "all 0.3s",
      boxShadow: "0 10px 25px rgba(13, 148, 136, 0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.75rem",
    },
  };

  return (
    <>
      <TopBar />
      <Header />

      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <span>✨</span>
            <span>Powered by AI</span>
          </div>
          <h1 style={styles.mainTitle}>
            Your Perfect Journey,
            <br />
            <span style={styles.gradientText}>Crafted by AI</span>
          </h1>
          <p style={styles.subtitle}>
            Answer a few questions and let our AI create a personalized
            itinerary tailored just for you
          </p>
        </div>
      </div>

      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          paddingBottom: "3rem",
        }}
      >
        <div style={styles.container}>
          {/* Form Card */}
          <div style={styles.formCard}>
            {/* Progress Bar */}
            <div style={styles.progressBar}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  maxWidth: "900px",
                  margin: "0 auto",
                }}
              >
                {[
                  { label: "Destination", icon: "📍" },
                  { label: "Budget", icon: "💰" },
                  { label: "Preferences", icon: "✨" },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    style={{ display: "flex", alignItems: "center", flex: 1 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: "3rem",
                          height: "3rem",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          color: "white",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                          background:
                            "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
                          fontSize: "1.5rem",
                        }}
                      >
                        {step.icon}
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "#374151",
                          marginTop: "0.5rem",
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div
                        style={{
                          flex: 1,
                          height: "0.25rem",
                          background:
                            "linear-gradient(90deg, #14b8a6 0%, #06b6d4 100%)",
                          margin: "0 0.5rem",
                          borderRadius: "9999px",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} style={styles.formContent}>
              {/* Step 1 */}
              <div style={{ marginBottom: "3rem" }}>
                <div style={styles.sectionHeader}>
                  <div
                    style={{
                      ...styles.iconBox,
                      background:
                        "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>📍</span>
                  </div>
                  <h2 style={styles.sectionTitle}>Where, When & Who</h2>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1.5rem",
                    marginBottom: "2rem",
                  }}
                >
                  {/* Destination */}
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={styles.label}>✈️ Destination</label>
                    <input
                      type="text"
                      placeholder="Enter destination (e.g., Hanoi, Da Nang, Ho Chi Minh City...)"
                      value={formData.destination}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          destination: e.target.value,
                        }))
                      }
                      style={{
                        ...styles.input,
                        fontSize: "1rem",
                        fontWeight: "500",
                      }}
                      required
                    />
                  </div>

                  {/* Participants */}
                  <div>
                    <label style={styles.label}>👥 Travelers</label>
                    <div style={styles.counterContainer}>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            participants: Math.max(1, prev.participants - 1),
                          }))
                        }
                        style={{
                          ...styles.counterButton,
                          borderRight: "2px solid #e5e7eb",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#f0fdfa")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "white")
                        }
                      >
                        −
                      </button>
                      <div style={styles.counterValue}>
                        {formData.participants}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            participants: prev.participants + 1,
                          }))
                        }
                        style={{
                          ...styles.counterButton,
                          borderLeft: "2px solid #e5e7eb",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#f0fdfa")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "white")
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Age Range */}
                  <div>
                    <label style={styles.label}>⏰ Age Range</label>
                    <input
                      type="text"
                      placeholder="e.g., 25-35"
                      value={formData.ageRange}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          ageRange: e.target.value,
                        }))
                      }
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label style={styles.label}>📅 Trip Duration</label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            duration_days: days,
                          }))
                        }
                        style={styles.durationButton(
                          formData.duration_days === days
                        )}
                        onMouseEnter={(e) => {
                          if (formData.duration_days !== days) {
                            e.target.style.borderColor = "#14b8a6";
                            e.target.style.transform = "translateY(-2px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (formData.duration_days !== days) {
                            e.target.style.borderColor = "#e5e7eb";
                            e.target.style.transform = "translateY(0)";
                          }
                        }}
                      >
                        {days} {days === 1 ? "day" : "days"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2: Budget */}
              <div style={{ marginBottom: "3rem" }}>
                <div style={styles.sectionHeader}>
                  <div
                    style={{
                      ...styles.iconBox,
                      background:
                        "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>💰</span>
                  </div>
                  <h2 style={styles.sectionTitle}>Budget Level</h2>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1.25rem",
                  }}
                >
                  {BUDGET_OPTIONS.map((budget) => (
                    <label key={budget.value} style={{ cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="budget"
                        value={budget.value}
                        checked={formData.budget_level === budget.value}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            budget_level: e.target.value,
                          }))
                        }
                        style={{ display: "none" }}
                      />
                      <div
                        style={styles.budgetCard(
                          formData.budget_level === budget.value,
                          budget.gradient
                        )}
                        onMouseEnter={(e) => {
                          if (formData.budget_level !== budget.value) {
                            e.currentTarget.style.transform =
                              "translateY(-4px)";
                            e.currentTarget.style.boxShadow =
                              "0 8px 16px rgba(0,0,0,0.1)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (formData.budget_level !== budget.value) {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 6px rgba(0,0,0,0.05)";
                          }
                        }}
                      >
                        <div
                          style={{
                            fontSize: "3rem",
                            marginBottom: "1rem",
                            transition: "transform 0.3s",
                          }}
                        >
                          {budget.emoji}
                        </div>
                        <div
                          style={{
                            fontWeight: "700",
                            fontSize: "1.25rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {budget.title}
                        </div>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            opacity:
                              formData.budget_level === budget.value
                                ? 0.9
                                : 0.6,
                          }}
                        >
                          {budget.description}
                        </div>
                        {formData.budget_level === budget.value && (
                          <div
                            style={{
                              position: "absolute",
                              top: "0.75rem",
                              right: "0.75rem",
                              width: "1.5rem",
                              height: "1.5rem",
                              backgroundColor: "white",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              style={{
                                width: "0.75rem",
                                height: "0.75rem",
                                background:
                                  "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
                                borderRadius: "50%",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 3: Preferences */}
              <div style={{ marginBottom: "2rem" }}>
                <div style={styles.sectionHeader}>
                  <div
                    style={{
                      ...styles.iconBox,
                      background:
                        "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>✨</span>
                  </div>
                  <h2 style={styles.sectionTitle}>Your Preferences</h2>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1.25rem",
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
                    color: "white",
                    fontSize: "0.875rem",
                    borderRadius: "1rem",
                    marginBottom: "1.5rem",
                    boxShadow: "0 4px 6px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <span style={{ fontSize: "1.25rem" }}>✨</span>
                  <span style={{ fontWeight: "500" }}>
                    Select 2-4 preferences for the best personalized results
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {preferenceTags.map((pref) => {
                    const isSelected = formData.preferences.includes(pref.id);
                    return (
                      <button
                        key={pref.id}
                        type="button"
                        onClick={() => handlePreferenceToggle(pref.id)}
                        style={styles.preferenceButton(
                          isSelected,
                          pref.gradient
                        )}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.transform =
                              "translateY(-4px)";
                            e.currentTarget.style.borderColor = "#14b8a6";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.borderColor = "#e5e7eb";
                          }
                        }}
                      >
                        <div
                          style={{
                            fontSize: "2rem",
                            marginBottom: "0.5rem",
                            transition: "transform 0.3s",
                          }}
                        >
                          {pref.icon}
                        </div>
                        <div>{pref.label}</div>
                        {isSelected && (
                          <div
                            style={{
                              position: "absolute",
                              top: "0.5rem",
                              right: "0.5rem",
                              width: "1.5rem",
                              height: "1.5rem",
                              backgroundColor: "white",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          >
                            <span
                              style={{
                                color: "#14b8a6",
                                fontSize: "1.125rem",
                                fontWeight: "700",
                              }}
                            >
                              ✓
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#fef2f2",
                    borderLeft: "4px solid #ef4444",
                    borderRadius: "0.5rem",
                    color: "#991b1b",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <span style={{ fontSize: "1.25rem" }}>❌</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={styles.submitButton}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 15px 30px rgba(13, 148, 136, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 25px rgba(13, 148, 136, 0.3)";
                  }
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: "1.5rem",
                        height: "1.5rem",
                        border: "3px solid white",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    <span>{loadingMessage || "Generating..."}</span>
                    <style>
                      {`@keyframes spin { to { transform: rotate(360deg); } }`}
                    </style>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: "1.5rem" }}>✨</span>
                    <span>Generate My Perfect Itinerary</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          {result && (
            <div
              style={{
                marginTop: "3rem",
                backgroundColor: "transparent",
                borderRadius: "1.5rem",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                overflow: "hidden",
                border: "3px solid #10b981",
                position: "relative",
              }}
            >
              {/* Success Banner */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  padding: "1rem",
                  textAlign: "center",
                  fontSize: "1rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>🎉</span>
                <span>Your Perfect Itinerary is Ready!</span>
                <span style={{ fontSize: "1.5rem" }}>✨</span>
              </div>

              <NewItineraryView data={result} showActions={true} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AIItineraryGenerator;
