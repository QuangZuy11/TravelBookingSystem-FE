import React from "react";
import "./WhyVietTravel.css";
import { Shield, Headphones, Award, Zap, Users, Globe } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Đảm Bảo An Toàn",
    description:
      "Bảo hiểm du lịch toàn diện và đội ngũ hướng dẫn viên chuyên nghiệp",
  },
  {
    icon: Headphones,
    title: "Hỗ Trợ 24/7",
    description: "Đội ngũ tư vấn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi",
  },
  {
    icon: Award,
    title: "Chất Lượng Đảm Bảo",
    description: "Được chứng nhận bởi Tổng cục Du lịch Việt Nam",
  },
  {
    icon: Zap,
    title: "Công Nghệ AI",
    description: "Ứng dụng trí tuệ nhân tạo để tối ưu trải nghiệm du lịch",
  },
  {
    icon: Users,
    title: "Cộng Đồng Lớn",
    description: "Hơn 50,000 khách hàng tin tưởng và đồng hành",
  },
  {
    icon: Globe,
    title: "Phủ Sóng Toàn Quốc",
    description: "Mạng lưới đối tác rộng khắp 63 tỉnh thành",
  },
];

const WhyVietTravel = () => {
  return (
    <section className="why-container">
      <div className="why-header">
        <h2 className="why-title">Tại Sao Chọn VietTravel?</h2>
        <p className="why-subtitle">
          Chúng tôi cam kết mang đến những trải nghiệm du lịch tuyệt vời nhất
          với công nghệ hiện đại
        </p>
      </div>

      {/* Features Grid */}
      <div className="why-grid">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div key={index} className="why-card">
              <div className="why-icon">
                <IconComponent size={24} />
              </div>
              <h3 className="why-card-title">{feature.title}</h3>
              <p className="why-card-text">{feature.description}</p>
            </div>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="why-stats">
        <div>
          <div className="why-stat-value">1000+</div>
          <div className="why-stat-label">Tour Du Lịch</div>
        </div>
        <div>
          <div className="why-stat-value">50K+</div>
          <div className="why-stat-label">Khách Hàng Hài Lòng</div>
        </div>
        <div>
          <div className="why-stat-value">4.9/5</div>
          <div className="why-stat-label">Đánh Giá Trung Bình</div>
        </div>
        <div>
          <div className="why-stat-value">24/7</div>
          <div className="why-stat-label">Hỗ Trợ Khách Hàng</div>
        </div>
      </div>
    </section>
  );
};

export default WhyVietTravel;
