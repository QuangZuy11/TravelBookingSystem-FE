import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, MapPin, Star, ShieldCheck } from "lucide-react";
import Topbar from "../../../components/layout/Topbar/Topbar";
import Header from "../../../components/layout/Header/Header";
import Footer from "../../../components/layout/Footer/Footer";
import "./PointsOfInterestPage.css";

const PointsOfInterestPage = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || ""}/api/poinOfinterest/getpoin`
        );

        if (!response.ok) {
          throw new Error("Không thể tải danh sách điểm tham quan");
        }

        const data = await response.json();
        const sanitized = Array.isArray(data)
          ? data.filter((poi) => {
              const hasName = Boolean(poi.name || poi.destination_name);
              const hasImage = Boolean(poi.image_url);
              const hasPrice = typeof poi.price?.current === "number";
              const hasAddress = Boolean(poi.address);
              return hasName || hasImage || hasPrice || hasAddress;
            })
          : [];
        setPoints(sanitized);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  const destinationOptions = useMemo(() => {
    const names = points
      .map((poi) => poi.destination_name)
      .filter((name) => !!name);
    return Array.from(new Set(names));
  }, [points]);

  const filteredPoints = useMemo(() => {
    let data = points.slice();

    data = data.filter((poi) => {
      const hasName = Boolean(poi.name || poi.destination_name);
      const hasImage = Boolean(poi.image_url);
      const hasPrice = typeof poi.price?.current === "number";
      const hasAddress = Boolean(poi.address);
      return hasName || hasImage || hasPrice || hasAddress;
    });

    if (searchQuery) {
      const normalized = searchQuery.toLowerCase();
      data = data.filter((poi) => {
        const displayName = `${poi.name || ""} ${poi.destination_name || ""}`.toLowerCase();
        return displayName.includes(normalized);
      });
    }

    if (destinationFilter !== "all") {
      data = data.filter(
        (poi) =>
          (poi.destination_name || "").toLowerCase() === destinationFilter.toLowerCase()
      );
    }

    if (priceFilter !== "all") {
      const [minRaw, maxRaw] = priceFilter.split("-");
      const min = Number(minRaw);
      const max = maxRaw === "+" ? Infinity : Number(maxRaw);
      data = data.filter((poi) => {
        const currentPrice = poi.price?.current;
        if (typeof currentPrice !== "number") return false;
        return currentPrice >= min && currentPrice <= max;
      });
    }

    if (sortBy === "price-asc") {
      data.sort(
        (a, b) =>
          (a.price?.current ?? Number.MAX_SAFE_INTEGER) -
          (b.price?.current ?? Number.MAX_SAFE_INTEGER)
      );
    } else if (sortBy === "price-desc") {
      data.sort(
        (a, b) =>
          (b.price?.current ?? 0) -
          (a.price?.current ?? 0)
      );
    } else if (sortBy === "name-asc") {
      data.sort((a, b) => {
        const aName = (a.name || a.destination_name || "").toLowerCase();
        const bName = (b.name || b.destination_name || "").toLowerCase();
        return aName.localeCompare(bName);
      });
    }

    return data;
  }, [points, searchQuery, destinationFilter, priceFilter, sortBy]);

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div className="poi-status-card">
          Đang tải danh sách điểm tham quan...
        </div>
      );
    }

    if (error) {
      return (
        <div className="poi-status-card poi-status-error">{error}</div>
      );
    }

    if (filteredPoints.length === 0) {
      return <div className="poi-status-card">Chưa có điểm tham quan nào.</div>;
    }

    return (
      <section className="poi-grid">
        {filteredPoints.map((poi, index) => {
          const displayName =
            poi.name || poi.destination_name || "Điểm tham quan";
          const address = poi.address || "Đang cập nhật địa chỉ";
          const currentPrice = poi.price?.current ?? null;
          const originalPrice = poi.price?.original ?? null;
          const currency = poi.price?.currency || "VND";
          const hasDiscount =
            typeof currentPrice === "number" &&
            typeof originalPrice === "number" &&
            originalPrice > currentPrice;
          const discountPercent = hasDiscount
            ? Math.round(100 - (currentPrice / originalPrice) * 100)
            : null;
          const ratingValue =
            poi.ratings?.average ?? poi.rating ?? poi.averageRating ?? null;
          const ratingCount =
            poi.ratings?.count ?? poi.ratingCount ?? poi.totalReviews ?? null;

          return (
            <article
              className="poi-card"
              key={`${poi.destination_id}-${index}`}
            >
              <div className="poi-card-image-wrapper">
                {poi.image_url ? (
                  <img
                    src={poi.image_url}
                    alt={displayName}
                    className="poi-card-image"
                  />
                ) : (
                  <div className="poi-card-image placeholder" />
                )}
                {poi.tag && <span className="poi-card-badge">{poi.tag}</span>}
              </div>

              <div className="poi-card-body">
                <h2 className="poi-card-title">{displayName}</h2>

                <div className="poi-card-meta">
                  <span className="poi-card-meta-item">
                    <MapPin size={16} />
                    <span className="poi-card-meta-text">{address}</span>
                  </span>
                  <span className="poi-card-meta-item">
                    <Star size={16} />
                    <span className="poi-card-meta-text">
                      {typeof ratingValue === "number"
                        ? `${ratingValue.toFixed(1)} ${
                            ratingCount ? `(${ratingCount} đánh giá)` : ""
                          }`
                        : "Chưa có đánh giá"}
                    </span>
                  </span>
                </div>

                {poi.refund_policy && (
                  <div className="poi-card-refund">
                    <ShieldCheck size={16} />
                    <span>{poi.refund_policy}</span>
                  </div>
                )}

                <div className="poi-card-pricing">
                  <span className="poi-card-pricing-label">Giá từ</span>
                  <div className="poi-card-price-row">
                    {currentPrice !== null && (
                      <span className="poi-card-price-current">
                        {currentPrice.toLocaleString("vi-VN")} {currency}
                      </span>
                    )}
                    {hasDiscount && (
                      <>
                        <span className="poi-card-price-original">
                          {originalPrice.toLocaleString("vi-VN")} {currency}
                        </span>
                        <span className="poi-card-discount">
                          -{discountPercent}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="poi-card-links">
                  <Link to={`/destination/${poi.destination_id}`}>
                    Xem điểm đến
                  </Link>
                  <Link to="/tour">Tìm tour liên quan</Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    );
  };

  return (
    <>
      <Topbar />
      <Header />
      <main className="poi-page">
        <section className="poi-hero">
          <h1>Khám phá Điểm Tham Quan</h1>
          <p>
            Tổng hợp các điểm tham quan nổi bật với thông tin giá, chính sách
            hoàn tiền và gợi ý dành cho chuyến đi của bạn.
          </p>
        </section>

        <section className="poi-filter-card">
          <div className="poi-filter-card-header">
            <Filter size={20} />
            <h2>Tìm kiếm và lọc tour</h2>
          </div>

          <div className="poi-filter-grid">
            <div className="poi-filter-item">
              <label>Tìm kiếm</label>
              <input
                type="text"
                placeholder="Nhập tên điểm tham quan..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>

            <div className="poi-filter-item">
              <label>Điểm đến</label>
              <select
                value={destinationFilter}
                onChange={(event) => setDestinationFilter(event.target.value)}
              >
                <option value="all">Tất cả</option>
                {destinationOptions.map((destination) => (
                  <option key={destination} value={destination}>
                    {destination}
                  </option>
                ))}
              </select>
            </div>

            <div className="poi-filter-item">
              <label>Mức giá</label>
              <select
                value={priceFilter}
                onChange={(event) => setPriceFilter(event.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="0-200000">Dưới 200.000</option>
                <option value="200000-500000">200.000 - 500.000</option>
                <option value="500000-1000000">500.000 - 1.000.000</option>
                <option value="1000000-+">Trên 1.000.000</option>
              </select>
            </div>

            <div className="poi-filter-item">
              <label>Sắp xếp</label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="name-asc">Tên A → Z</option>
              </select>
            </div>

            <div className="poi-filter-item">
              <label>&nbsp;</label>
              <button onClick={handleSearch} className="poi-btn-primary">
                <Search size={16} style={{ marginRight: 6 }} />
                Tìm kiếm
              </button>
            </div>
          </div>
        </section>

        {renderResults()}
      </main>
      <Footer />
    </>
  );
};

export default PointsOfInterestPage;
