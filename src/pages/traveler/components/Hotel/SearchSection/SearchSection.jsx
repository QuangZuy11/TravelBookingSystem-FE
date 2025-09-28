import React, { useState, useRef, useEffect } from "react";
import "../SearchSection/SearchSection.css";

export default function SearchSection({ onSearch }) {
    const [location, setLocation] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [rooms, setRooms] = useState(1);
    const [openGuests, setOpenGuests] = useState(false);
    const [suggestions] = useState([
        "Hà Nội, Việt Nam",
        "Hồ Chí Minh, Việt Nam",
        "Đà Nẵng, Việt Nam",
        "Nha Trang, Việt Nam",
        "Hạ Long, Việt Nam",
    ]);
    const wrapperRef = useRef(null);

    // Close popovers / suggestion on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpenGuests(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleSearch(e) {
        e?.preventDefault();
        const payload = {
            location,
            checkIn,
            checkOut,
            adults,
            children,
            rooms,
        };
        if (onSearch) onSearch(payload);
        else console.log("Search payload:", payload);
    }

    function resetAll() {
        setLocation("");
        setCheckIn("");
        setCheckOut("");
        setAdults(2);
        setChildren(0);
        setRooms(1);
        setOpenGuests(false);
    }

    const guestsLabel = `${adults} người lớn, ${children} trẻ em, ${rooms} phòng`;

    return (
        <section className="ss-hero" aria-label="Search section">
            <div className="ss-hero-inner">
                <h2 className="ss-slogan">Thoải mái như ở nhà </h2>

                <form className="ss-search-wrap" onSubmit={handleSearch} ref={wrapperRef} role="search">
                    <div className="ss-field ss-location">
                        <label className="ss-label">Vị trí</label>
                        <div className="ss-input-icon">
                            <svg className="ss-icon" viewBox="0 0 24 24" aria-hidden>
                                <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                            </svg>
                            <input
                                className="ss-input"
                                list="ss-locs"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Vị trí (ví dụ: Hà Nội)"
                                aria-label="Vị trí"
                                autoComplete="off"
                            />
                            <datalist id="ss-locs">
                                {suggestions.map((s) => (
                                    <option key={s} value={s} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    <div className="ss-field ss-date">
                        <label className="ss-label">Ngày Check-in</label>
                        <div className="ss-input-icon">
                            <svg className="ss-icon" viewBox="0 0 24 24" aria-hidden>
                                <path fill="currentColor" d="M7 10h5v5H7zM19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                            </svg>
                            <input
                                className="ss-input"
                                type="date"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                aria-label="Check-in"
                            />
                        </div>
                    </div>

                    <div className="ss-field ss-date">
                        <label className="ss-label">Ngày Check-out</label>
                        <div className="ss-input-icon">
                            <svg className="ss-icon" viewBox="0 0 24 24" aria-hidden>
                                <path fill="currentColor" d="M7 10h5v5H7zM19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                            </svg>
                            <input
                                className="ss-input"
                                type="date"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                aria-label="Check-out"
                            />
                        </div>
                    </div>

                    <div className="ss-field ss-guests">
                        <label className="ss-label">Người / Phòng</label>
                        <button
                            type="button"
                            className="ss-guests-toggle"
                            aria-haspopup="dialog"
                            aria-expanded={openGuests}
                            onClick={() => setOpenGuests((s) => !s)}
                        >
                            <span className="ss-guests-text">{guestsLabel}</span>
                            <svg className="ss-chev" viewBox="0 0 24 24" aria-hidden>
                                <path fill="currentColor" d="M7 10l5 5 5-5z" />
                            </svg>
                        </button>

                        {openGuests && (
                            <div className="ss-guests-pop" role="dialog" aria-label="Chọn số người và phòng">
                                <div className="ss-pop-row">
                                    <div className="ss-pop-item">
                                        <div className="ss-pop-title">Người lớn</div>
                                        <div className="ss-counter">
                                            <button aria-label="Giảm người lớn" onClick={() => setAdults((a) => Math.max(1, a - 1))}>−</button>
                                            <div className="ss-count">{adults}</div>
                                            <button aria-label="Tăng người lớn" onClick={() => setAdults((a) => Math.min(20, a + 1))}>+</button>
                                        </div>
                                    </div>

                                    <div className="ss-pop-item">
                                        <div className="ss-pop-title">Trẻ em</div>
                                        <div className="ss-counter">
                                            <button aria-label="Giảm trẻ em" onClick={() => setChildren((c) => Math.max(0, c - 1))}>−</button>
                                            <div className="ss-count">{children}</div>
                                            <button aria-label="Tăng trẻ em" onClick={() => setChildren((c) => Math.min(10, c + 1))}>+</button>
                                        </div>
                                    </div>

                                    <div className="ss-pop-item">
                                        <div className="ss-pop-title">Phòng</div>
                                        <div className="ss-counter">
                                            <button aria-label="Giảm phòng" onClick={() => setRooms((r) => Math.max(1, r - 1))}>−</button>
                                            <div className="ss-count">{rooms}</div>
                                            <button aria-label="Tăng phòng" onClick={() => setRooms((r) => Math.min(8, r + 1))}>+</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="ss-pop-actions">
                                    <button type="button" className="ss-btn ss-ghost" onClick={() => { setAdults(2); setChildren(0); setRooms(1); }}>
                                        Đặt lại
                                    </button>
                                    <button type="button" className="ss-btn ss-primary" onClick={() => setOpenGuests(false)}>
                                        Xong
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="ss-field ss-action">
                        <button className="ss-search-btn" type="submit" aria-label="Tìm kiếm">
                            <svg className="ss-search-icon" viewBox="0 0 24 24" aria-hidden>
                                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6z" />
                            </svg>
                        </button>

                        <button type="button" className="ss-clear" onClick={resetAll} aria-label="Xóa">
                            Xóa
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}