import React from "react";
import { Sparkles, TrendingUp, User, Zap } from "lucide-react";
import "./AITitle.css";

const recommendations = [
  {
    icon: TrendingUp,
    title: "Trending Destinations",
    subtitle: "Điểm đến hot nhất hiện tại",
    description:
      "AI phân tích xu hướng tìm kiếm và đặt tour để gợi ý những điểm đến đang được yêu thích nhất.",
    features: ["Phân tích big data", "Cập nhật real-time", "Dự đoán xu hướng"],
    color: "blue",
  },
  {
    icon: User,
    title: "Personalized Tours",
    subtitle: "Tour được cá nhân hóa",
    description:
      "Dựa trên lịch sử tìm kiếm và sở thích cá nhân để đề xuất những tour phù hợp nhất với bạn.",
    features: ["Machine learning", "Phân tích hành vi", "Gợi ý thông minh"],
    color: "green",
  },
  {
    icon: Zap,
    title: "Smart Optimization",
    subtitle: "Tối ưu hóa thông minh",
    description:
      "AI tự động tối ưu hóa lịch trình, giá cả và dịch vụ để mang lại trải nghiệm tốt nhất.",
    features: ["Tối ưu giá cả", "Lịch trình linh hoạt", "Dịch vụ tốt nhất"],
    color: "purple",
  },
];

export default function AITitle() {
  return (
    <section className="ai-section">
      <div className="ai-container">
        {/* Section Header */}
        <div className="ai-header">
          <div className="ai-icon-wrapper">
            <Sparkles className="ai-icon" />
          </div>
          <h2 className="ai-title">Gợi Ý Thông Minh Từ AI</h2>
          <p className="ai-subtitle">
            Trải nghiệm công nghệ AI tiên tiến giúp bạn tìm ra những tour du
            lịch hoàn hảo nhất
          </p>
        </div>

        {/* Recommendation Cards */}
        <div className="ai-grid">
          {recommendations.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="ai-card">
                <div className={`ai-card-icon ${item.color}`}>
                  <IconComponent className="ai-card-icon-inner" />
                </div>
                <h3 className="ai-card-title">{item.title}</h3>
                <p className="ai-card-subtitle">{item.subtitle}</p>
                <p className="ai-card-desc">{item.description}</p>
                <ul className="ai-features">
                  {item.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <button className="ai-btn">Khám Phá Ngay</button>
              </div>
            );
          })}
        </div>

        {/* AI Stats */}
        <div className="ai-stats">
          <div className="ai-stats-header">
            <h3>Sức Mạnh Của AI</h3>
            <p>Những con số ấn tượng từ hệ thống AI của chúng tôi</p>
          </div>
          <div className="ai-stats-grid">
            <div>
              <div className="ai-stats-number">99.2%</div>
              <div className="ai-stats-label">Độ Chính Xác</div>
            </div>
            <div>
              <div className="ai-stats-number">0.3s</div>
              <div className="ai-stats-label">Thời Gian Phản Hồi</div>
            </div>
            <div>
              <div className="ai-stats-number">1M+</div>
              <div className="ai-stats-label">Dữ Liệu Phân Tích</div>
            </div>
            <div>
              <div className="ai-stats-number">24/7</div>
              <div className="ai-stats-label">Hoạt Động Liên Tục</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
