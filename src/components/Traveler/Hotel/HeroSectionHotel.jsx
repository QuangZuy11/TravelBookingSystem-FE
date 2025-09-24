import "../Hotel/HeroSectionHotel.css";

export default function HeroSectionHotel() {
    return (
        <section className="hero">
            <div className="hero-bg"></div>
            <div className="hero-content">
                <h1>
                    Khám Phá Khách Sạn <br />
                    <span>Lựa chọn tùy thích</span>
                </h1>
                <p>
                    Trải nghiệm đặt phòng khách sạn cá nhân hóa với công nghệ thông minh. Tìm kiếm, đặt phòng và khám phá những nơi tuyệt vời nhất tại Việt Nam.
                </p>
                <div className="hero-actions">
                    <button className="book-btn">Đặt Phòng Ngay →</button>
                    <button className="video-btn">Xem Video</button>
                </div>
                <div className="hero-stats">
                    <div>
                        <b>2000+</b>
                        <span>Khách Sạn</span>
                    </div>
                    <div>
                        <b>100K+</b>
                        <span>Khách Hàng</span>
                    </div>
                    <div>
                        <b>4.8★</b>
                        <span>Đánh Giá</span>
                    </div>
                </div>
            </div>
        </section>
    );
}