import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import Overview from "../HotelDetail/Overview";
import Rooms from "../HotelDetail/Room";
import Location from "../HotelDetail/Location";
import Amenities from "../HotelDetail/Amenities";
import Policies from "../HotelDetail/Policies";
import Reviews from "../HotelDetail/Reviews";
import "../HotelDetail/HotelDetail.css"

const HotelDetail = () => {
    const { id } = useParams()
    const [activeSection, setActiveSection] = useState("overview")
    const [hotelData, setHotelData] = useState(null)
    const [roomsData, setRoomsData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [roomsLoading, setRoomsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [roomsError, setRoomsError] = useState(null)

    // Fetch hotel data from API
    useEffect(() => {
        const fetchHotelData = async () => {
            if (!id) return

            try {
                setLoading(true)
                setError(null)

                // Gọi API search để lấy thông tin khách sạn theo ID
                const response = await fetch(`http://localhost:3000/api/traveler/hotels/search?hotelId=${id}`)

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`)
                }

                const data = await response.json()

                // Tìm khách sạn có ID khớp trong kết quả
                const hotel = data?.data?.hotels?.find(h => h._id === id)

                if (hotel) {
                    setHotelData(hotel)
                } else {
                    throw new Error('Không tìm thấy thông tin khách sạn')
                }
            } catch (err) {
                console.error('Error fetching hotel data:', err)
                setError(err.message || 'Lỗi tải dữ liệu khách sạn')
            } finally {
                setLoading(false)
            }
        }

        fetchHotelData()
    }, [id])

    // Fetch rooms data from API
    useEffect(() => {
        const fetchRoomsData = async () => {
            if (!id) return

            try {
                setRoomsLoading(true)
                setRoomsError(null)

                // Gọi API lấy thông tin phòng
                const response = await fetch(`http://localhost:3000/api/traveler/hotels/${id}/rooms`)

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`)
                }

                const data = await response.json()
                console.log('Rooms API response:', data) // Debug log
                console.log('Rooms data structure:', data.data) // Debug structure

                if (data.success && data.data) {
                    setRoomsData(data.data)
                } else {
                    throw new Error('Không có dữ liệu phòng')
                }
            } catch (err) {
                console.error('Error fetching rooms data:', err)
                setRoomsError(err.message || 'Lỗi tải dữ liệu phòng')
            } finally {
                setRoomsLoading(false)
            }
        }

        fetchRoomsData()
    }, [id])

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

    if (loading) {
        return (
            <div className="hotel-overview">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50vh',
                    fontSize: '18px',
                    color: '#666'
                }}>
                    Đang tải thông tin khách sạn...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="hotel-overview">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50vh',
                    fontSize: '18px',
                    color: '#d32f2f',
                    textAlign: 'center'
                }}>
                    <div>
                        <div>❌ {error}</div>
                        <div style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
                            Vui lòng thử lại sau
                        </div>
                    </div>
                </div>
            </div>
        )
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

            <Overview hotelData={hotelData} />
            <Rooms
                roomsData={roomsData}
                loading={roomsLoading}
                error={roomsError}
            />
            <Location />
            <Amenities />
            <Policies hotelData={hotelData} />
            <Reviews />
        </div>
    )
}

export default HotelDetail;