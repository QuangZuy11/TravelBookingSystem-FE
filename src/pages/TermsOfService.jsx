import React, { useState } from "react";
import {
  XCircle,
  Calendar,
  Users,
  Shield,
  CreditCard,
  FileText,
  Info,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import TopBar from "../components/layout/Topbar/Topbar";
import Header from "../components/layout/Header/Header";
import Footer from "../components/layout/Footer/Footer";
import "./TermsOfService..css";

export default function TermsAndConditions() {
  const [activeTab, setActiveTab] = useState(0);

  const terms = [
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "Thanh Toán & Hoàn Tiền",
      color: "teal",
      highlight: true,
      items: [
        {
          text: "Sau khi đặt tour và hoàn tất thanh toán, nếu quý khách muốn hủy tour sẽ KHÔNG được hoàn lại tiền đã thanh toán.",
          important: true,
        },
        {
          text: "Quý khách cần thanh toán đầy đủ 100% giá tour trước ngày khởi hành ít nhất 7 ngày.",
          important: false,
        },
        {
          text: "VietTravel chấp nhận thanh toán qua chuyển khoản ngân hàng, thẻ tín dụng và ví điện tử.",
          important: false,
        },
        {
          text: "Hóa đơn VAT sẽ được xuất trong vòng 3 ngày làm việc sau khi thanh toán thành công.",
          important: false,
        },
      ],
    },
    {
      icon: <XCircle className="w-5 h-5" />,
      title: "Chính Sách Hủy Tour",
      color: "red",
      items: [
        {
          text: "Hủy tour trước 30 ngày: Không hoàn tiền nhưng có thể chuyển sang tour khác (phụ thu nếu có).",
          important: true,
        },
        {
          text: "Hủy tour từ 15-29 ngày: Mất 100% tiền cọc, không được chuyển tour.",
          important: true,
        },
        {
          text: "Hủy tour dưới 15 ngày: Mất 100% tổng giá trị tour, không hoàn tiền.",
          important: true,
        },
        {
          text: "Trường hợp bất khả kháng (thiên tai, dịch bệnh): Xem xét hoàn lại 50% hoặc đổi lịch.",
          important: false,
        },
      ],
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Thay Đổi Lịch Trình",
      color: "teal",
      items: [
        {
          text: "VietTravel có quyền điều chỉnh lịch trình khi cần thiết nhưng vẫn đảm bảo chất lượng tour.",
          important: false,
        },
        {
          text: "Khách hàng muốn thay đổi ngày khởi hành cần thông báo trước ít nhất 20 ngày.",
          important: false,
        },
        {
          text: "Phí thay đổi lịch trình: 10% giá tour (nếu còn chỗ trống trong tour mới).",
          important: true,
        },
        {
          text: "Không áp dụng đổi lịch trong mùa cao điểm (Tết, lễ lớn).",
          important: false,
        },
      ],
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Trách Nhiệm Khách Hàng",
      color: "teal",
      items: [
        {
          text: "Cung cấp thông tin chính xác khi đặt tour (họ tên, CMND/CCCD, số điện thoại).",
          important: false,
        },
        {
          text: "Có mặt đúng giờ tại điểm tập trung. Nếu đi muộn, VietTravel không chịu trách nhiệm.",
          important: true,
        },
        {
          text: "Tuân thủ nội quy của tour, tôn trọng hướng dẫn viên và các thành viên khác.",
          important: false,
        },
        {
          text: "Tự bảo quản tài sản cá nhân. VietTravel không chịu trách nhiệm về thất lạc tài sản.",
          important: true,
        },
      ],
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Bảo Hiểm & Sức Khỏe",
      color: "teal",
      items: [
        {
          text: "Giá tour đã bao gồm bảo hiểm du lịch cơ bản theo quy định pháp luật.",
          important: false,
        },
        {
          text: "Khách hàng phải đảm bảo sức khỏe tốt để tham gia tour.",
          important: true,
        },
        {
          text: "Thông báo trước nếu có bệnh mãn tính, dị ứng hoặc cần chế độ ăn đặc biệt.",
          important: false,
        },
        {
          text: "Phụ nữ mang thai từ 6 tháng trở lên cần có giấy xác nhận từ bác sĩ.",
          important: false,
        },
      ],
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Giá Tour & Chi Phí",
      color: "teal",
      items: [
        {
          text: "Giá tour bao gồm: vận chuyển, khách sạn, bữa ăn theo chương trình, vé tham quan, HDV.",
          important: false,
        },
        {
          text: "Giá tour KHÔNG bao gồm: chi phí cá nhân, đồ uống có cồn, tip HDV (tự nguyện).",
          important: false,
        },
        {
          text: "Trẻ em dưới 5 tuổi: miễn phí (ngủ chung với bố mẹ).",
          important: false,
        },
        {
          text: "Trẻ em từ 5-11 tuổi: 75% giá người lớn. Từ 12 tuổi trở lên: 100% giá người lớn.",
          important: false,
        },
      ],
    },
    {
      icon: <Info className="w-5 h-5" />,
      title: "Điều Khoản Chung",
      color: "teal",
      items: [
        {
          text: "Khi đặt tour, quý khách được xem là đã đồng ý với tất cả điều khoản này.",
          important: true,
        },
        {
          text: "VietTravel có quyền cập nhật điều khoản và sẽ thông báo trước ít nhất 7 ngày.",
          important: false,
        },
        {
          text: "Mọi tranh chấp sẽ được giải quyết theo pháp luật Việt Nam.",
          important: false,
        },
        {
          text: "VietTravel có quyền từ chối phục vụ khách có hành vi gây ảnh hưởng xấu đến tour.",
          important: false,
        },
      ],
    },
  ];

  return (
    <div className="terms-container">
      <TopBar />
      <Header />

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-pattern"></div>
        <div className="hero-content">
          <h1 className="hero-title">Điều Khoản & Chính Sách</h1>
          <p className="hero-subtitle">
            Trải nghiệm du lịch được cá nhân hóa với công nghệ AI tiên tiến
          </p>
          <p className="hero-date">Cập nhật: Tháng 10, 2025</p>
        </div>
      </div>

      {/* Alert Box */}
      <div className="alert-wrapper">
        <div className="alert-box">
          <div className="alert-content">
            <div className="alert-icon">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="alert-text">
              <h3 className="alert-title">Lưu Ý Quan Trọng</h3>
              <p className="alert-description">
                Sau khi đặt tour và thanh toán thành công, quý khách sẽ{" "}
                <span className="alert-highlight">KHÔNG được hoàn tiền</span>{" "}
                trong trường hợp hủy tour. Vui lòng cân nhắc kỹ trước khi xác
                nhận đặt tour.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Content */}
      <div className="terms-content">
        <div className="terms-grid">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">Danh Mục</h3>
              <div className="sidebar-menu">
                {terms.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`menu-item ${activeTab === idx ? "active" : ""}`}
                  >
                    {term.icon}
                    <span className="menu-text">{term.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="content-area">
            <div className="content-card">
              <div className="content-header">
                <div className="content-icon">{terms[activeTab].icon}</div>
                <h2 className="content-title">{terms[activeTab].title}</h2>
              </div>

              <div className="items-list">
                {terms[activeTab].items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`item ${
                      item.important ? "important" : "normal"
                    }`}
                  >
                    <div className="item-icon">
                      {item.important ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </div>
                    <p className="item-text">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
