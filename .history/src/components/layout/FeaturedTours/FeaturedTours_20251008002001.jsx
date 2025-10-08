import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, MapPin, Heart } from "lucide-react"
import Link from "next/link"

// Tour data moved inline to avoid import issues
const tours = [
  {
    id: 1,
    title: "Hạ Long Bay - Kỳ Quan Thế Giới",
    location: "Quảng Ninh",
    duration: "3 ngày 2 đêm",
    price: 2500000,
    originalPrice: 3000000,
    rating: 4.8,
    reviews: 245,
    image: "/halong-bay-luxury-cruise.jpg",
    highlights: ["Du thuyền sang trọng", "Hang Sửng Sốt", "Làng chài Cửa Vạn"],
    discount: "17%",
    tag: "Bán chạy",
  },
  {
    id: 2,
    title: "Sapa - Thiên Đường Mây Trắng",
    location: "Lào Cai",
    duration: "4 ngày 3 đêm",
    price: 1800000,
    originalPrice: 2200000,
    rating: 4.9,
    reviews: 189,
    image: "/sapa-fansipan-trekking.jpg",
    highlights: ["Ruộng bậc thang", "Fansipan", "Bản Cát Cát"],
    discount: "18%",
    tag: "Khuyến mãi",
  },
  {
    id: 3,
    title: "Phú Quốc - Đảo Ngọc Xanh",
    location: "Kiên Giang",
    duration: "5 ngày 4 đêm",
    price: 3200000,
    originalPrice: 3800000,
    rating: 4.7,
    reviews: 312,
    image: "/phu-quoc-beach-resort.jpg",
    highlights: ["Resort 5 sao", "Cáp treo Hòn Thơm", "Chợ đêm Dinh Cậu"],
    discount: "16%",
    tag: "Cao cấp",
  },
]

/**
 * Featured tours section component
 * Displays a grid of popular tour packages with pricing and details
 */
export function FeaturedTours() {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-space-grotesk font-bold text-3xl md:text-4xl mb-4">Tour Nổi Bật</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Khám phá những điểm đến tuyệt vời nhất Việt Nam với các tour được yêu thích nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <Card
              key={tour.id}
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative">
                <img
                  src={tour.image || "/placeholder.svg"}
                  alt={tour.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="destructive" className="bg-red-500 text-white">
                    -{tour.discount}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary">{tour.tag}</Badge>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute bottom-4 right-4 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {tour.title}
                  </CardTitle>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {tour.location}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Tour Info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      {tour.duration}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                      <span className="font-medium">{tour.rating}</span>
                      <span className="text-muted-foreground ml-1">({tour.reviews})</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1">
                    {tour.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                        {highlight}
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-primary">{formatPrice(tour.price)}</span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(tour.originalPrice)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">/ người</div>
                    </div>
                    <Link href={`/book/${tour.id}`}>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Đặt Ngay
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/search">
            <Button variant="outline" size="lg">
              Xem Tất Cả Tour
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
