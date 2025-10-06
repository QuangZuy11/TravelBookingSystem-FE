import "./HeroSection.css";

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 className="title">
            Khám Phá Việt Nam <br />
            <span className="highlight">Cùng AI Thông Minh</span>
          </h1>
          <p>
            Trải nghiệm du lịch được cá nhân hóa với công nghệ AI tiên tiến. Tìm
            kiếm, đặt tour và khám phá những điểm đến tuyệt vời nhất Việt Nam.
          </p>

          <div className="hero-buttons">
            <button className="btn primary">Khám Phá Ngay →</button>
            <button className="btn secondary">▶ Xem Video</button>
          </div>

          <div className="hero-stats">
            <div>
              <h3>1000+</h3>
              <p>Tour Du Lịch</p>
            </div>
            <div>
              <h3>50K+</h3>
              <p>Khách Hàng</p>
            </div>
            <div>
              <h3>4.9★</h3>
              <p>Đánh Giá</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
