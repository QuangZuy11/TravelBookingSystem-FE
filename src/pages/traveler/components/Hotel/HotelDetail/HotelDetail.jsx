import { useState, useEffect } from "react"
import Overview from "../HotelDetail/Overview";
import Rooms from "../HotelDetail/Room";
import Location from "../HotelDetail/Location";
import Amenities from "../HotelDetail/Amenities";
import Policies from "../HotelDetail/Policies";
import Reviews from "../HotelDetail/Reviews";
import "../HotelDetail/HotelDetail.css"

const HotelDetail = () => {
    const [activeSection, setActiveSection] = useState("overview")

    useEffect(() => {
        const handleScroll = () => {
            const sections = ["overview", "rooms", "location", "amenities", "policies", "reviews"]
            const scrollPosition = window.scrollY + 200

            for (const section of sections) {
                const element = document.getElementById(section)
                if (element) {
                    const offsetTop = element.offsetTop
                    const offsetBottom = offsetTop + element.offsetHeight

                    if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
                        setActiveSection(section)
                        break
                    }
                }
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId)
        if (element) {
            const offset = 80
            const elementPosition = element.offsetTop - offset
            window.scrollTo({
                top: elementPosition,
                behavior: "smooth",
            })
        }
    }

    return (
        <div className="hotel-overview">
            <nav className="hotel-detail-scroll-navigation">
                <button className={activeSection === "overview" ? "active" : ""} onClick={() => scrollToSection("overview")}>
                    Tổng quan
                </button>
                <button className={activeSection === "rooms" ? "active" : ""} onClick={() => scrollToSection("rooms")}>
                    Phòng
                </button>
                <button className={activeSection === "location" ? "active" : ""} onClick={() => scrollToSection("location")}>
                    Vị trí
                </button>
                <button className={activeSection === "amenities" ? "active" : ""} onClick={() => scrollToSection("amenities")}>
                    Tiện ích
                </button>
                <button className={activeSection === "policies" ? "active" : ""} onClick={() => scrollToSection("policies")}>
                    Chính sách
                </button>
                <button className={activeSection === "reviews" ? "active" : ""} onClick={() => scrollToSection("reviews")}>
                    Đánh giá
                </button>
            </nav>

            <Overview />
            <Rooms />
            <Location />
            <Amenities />
            <Policies />
            <Reviews />
        </div>
    )
}

export default HotelDetail;