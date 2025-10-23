import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-divider"></div>
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-logo">
              <div className="logo-icon">
                <MapPin className="icon" />
              </div>
              <span className="logo-text">VietTravel</span>
            </div>
            <p className="footer-desc">
              Nền tảng đặt tour du lịch hàng đầu Việt Nam với công nghệ AI thông
              minh, mang đến trải nghiệm du lịch tuyệt vời nhất.
            </p>
            <div className="footer-social">
              <button>
                <Facebook className="social-icon" />
              </button>
              <button>
                <Instagram className="social-icon" />
              </button>
              <button>
                <Youtube className="social-icon" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h3 className="footer-title">Liên Kết Nhanh</h3>
            <ul className="footer-links">
              <li>
                <p href="/tours">Tour Du Lịch</p>
              </li>
              <li>
                <p href="/search">Tìm Kiếm</p>
              </li>
              <li>
                <p href="#">Khuyến Mãi</p>
              </li>
              <li>
                <p href="#">Về Chúng Tôi</p>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h3 className="footer-title">Hỗ Trợ</h3>
            <ul className="footer-links">
              <li>
                <p href="#">Trung Tâm Trợ Giúp</p>
              </li>
              <li>
                <p href="#">Chính Sách</p>
              </li>
              <li>
                <p href="#">Điều Khoản</p>
              </li>
              <li>
                <p href="#">Liên Hệ</p>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="footer-col">
            <h3 className="footer-title">Liên Hệ</h3>
            <div className="footer-contact">
              <div className="contact-item">
                <Phone className="contact-icon-footer" />
                <span>1900-1234</span>
              </div>
              <div className="contact-item">
                <Mail className="contact-icon-footer" />
                <span>info@viettravel.com</span>
              </div>
            </div>

            <div className="newsletter">
              <div className="newsletter-form">
                <input type="email" placeholder="Email của bạn" />
                <button>Đăng Ký</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© 2024 VietTravel. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
