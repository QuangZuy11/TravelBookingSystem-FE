"use client";

import React, { useState, useEffect } from "react";
import "./ToursPage.css";
import { TourCard } from "./TourCard";
import { Search, Filter } from "lucide-react";

export default function ToursPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [filterDestination, setFilterDestination] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🧭 Hàm fetch tour từ backend
  const fetchTours = async () => {
    setLoading(true);
    let url = "http://localhost:3000/api/traveler/tours?";
    if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
    if (filterDestination !== "all")
      url += `destination=${encodeURIComponent(filterDestination)}&`;
    if (filterPrice !== "all") url += `price=${filterPrice}&`;
    if (sortBy !== "popular") url += `sortBy=${sortBy}&`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setTours(data.data || []);
    } catch (err) {
      console.error("Lỗi khi fetch tour:", err);
      setTours([]);
    }
    setLoading(false);
  };

  // ✅ Khi component mount, kiểm tra có dữ liệu tìm kiếm từ sessionStorage không
  useEffect(() => {
    // Chỉ chạy 1 lần khi component mount, không remount
    let mounted = true;

    const storedTours = sessionStorage.getItem("searchTours");
    const storedDestination = sessionStorage.getItem("searchDestination");

    console.log("🔄 ToursPage mounted");
    console.log("📦 sessionStorage searchTours:", storedTours);
    console.log("📦 sessionStorage searchDestination:", storedDestination);

    if (storedTours && storedTours !== "null" && storedTours !== "[]") {
      try {
        const parsedTours = JSON.parse(storedTours);

        console.log("🔍 Parsed tours:", parsedTours);
        console.log("🔍 Number of tours:", parsedTours.length);
        console.log("📍 Destination:", storedDestination);

        if (Array.isArray(parsedTours) && parsedTours.length > 0 && mounted) {
          // ✅ Dùng dữ liệu lưu trong sessionStorage
          console.log("✅ Setting tours from sessionStorage");

          // Set state trước
          setTours(parsedTours);
          setFilterDestination(storedDestination || "all");
          setSearchQuery(storedDestination || "");

          // Xóa sessionStorage SAU KHI set state
          setTimeout(() => {
            sessionStorage.removeItem("searchTours");
            sessionStorage.removeItem("searchDestination");
          }, 100);

          return; // Không fetch từ API
        }
      } catch (error) {
        console.error("❌ Error parsing tours from sessionStorage:", error);
      }
    }

    // Nếu không có dữ liệu trong sessionStorage, fetch từ API
    if (mounted) {
      console.log("🌐 Fetching tours from API");
      fetchTours();
    }

    // Cleanup function
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line
  }, []);

  const handleSearch = () => {
    fetchTours();
  };

  return (
    <div className="tours-page">
      <div className="tours-container">
        {/* Tiêu đề trang */}
        <div className="page-header">
          <h1>Tất cả tour du lịch</h1>
          <p>Khám phá những điểm đến tuyệt vời trên khắp Việt Nam</p>
        </div>

        {/* Khung lọc và tìm kiếm */}
        <div className="filter-card">
          <div className="filter-card-header">
            <Filter size={20} />
            <h2>Tìm kiếm và lọc tour</h2>
          </div>

          <div className="filter-grid">
            <div className="filter-item-ToursPage">
              <label>Tìm kiếm</label>
              <input
                type="text"
                placeholder="Nhập tên tour hoặc địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-item-ToursPage">
              <label>Điểm đến</label>
              <select
                value={filterDestination}
                onChange={(e) => setFilterDestination(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="Hạ Long">Hạ Long</option>
                <option value="Sapa">Sapa</option>
                <option value="Phú Quốc">Phú Quốc</option>
                <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Nha Trang">Nha Trang</option>
              </select>
            </div>

            <div className="filter-item-ToursPage">
              <label>Mức giá</label>
              <select
                value={filterPrice}
                onChange={(e) => setFilterPrice(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="0-0">Miễn phí</option>
                <option value="0-2000000">Dưới 2 triệu</option>
                <option value="2000000-4000000">2-4 triệu</option>
                <option value="4000000-999999999">Trên 4 triệu</option>
              </select>
            </div>

            <div className="filter-item-ToursPage">
              <label>Sắp xếp</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="price-low">Giá thấp đến cao</option>
                <option value="price-high">Giá cao đến thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>

            <div className="filter-item-ToursPage">
              <label>&nbsp;</label>
              <button
                onClick={handleSearch}
                className="btn-primary-ToursPage"
              >
                <Search size={16} style={{ marginRight: 6 }} />
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>

        {/* Đếm số tour */}
        <div className="tour-count">
          Hiển thị <span>{tours.length}</span> tour
        </div>

        {/* Lưới tour */}
        <div className="tour-grid">
          {loading ? (
            <div>Đang tải...</div>
          ) : tours.length > 0 ? (
            tours.map((tour) => {
              return <TourCard key={tour._id || tour.id} tour={tour} />;
            })
          ) : (
            <div className="no-results">
              <p>Không có tour nào để hiển thị</p>
            </div>
          )}
        </div>

        {/* Không tìm thấy kết quả */}
        {tours.length === 0 && !loading && (
          <div className="no-results">
            <p>Không tìm thấy tour phù hợp</p>
            <button
              className="btn-outline"
              onClick={() => {
                setSearchQuery("");
                setFilterDestination("all");
                setFilterPrice("all");
                setSortBy("popular");
                fetchTours();
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
