/**
 * @fileoverview Type definitions for Tour Module
 * Using JSDoc for type safety in JavaScript
 */

/**
 * @typedef {Object} Coordinates
 * @property {number} latitude
 * @property {number} longitude
 */

/**
 * @typedef {Object} Location
 * @property {string} address
 * @property {Coordinates} coordinates
 */

/**
 * @typedef {Object} TourCapacity
 * @property {number} min_participants
 * @property {number} max_participants
 * @property {number} current_bookings
 */

/**
 * @typedef {Object} BookingInfo
 * @property {number} advance_booking_days
 * @property {string} cancellation_policy
 * @property {number} booking_deadline
 */

/**
 * @typedef {Object} GroupDiscount
 * @property {number} min_group_size
 * @property {number} discount_percentage
 */

/**
 * @typedef {Object} TourPricing
 * @property {number} adult_price
 * @property {number} child_price
 * @property {number} infant_price
 * @property {GroupDiscount} group_discount
 */

/**
 * @typedef {Object} TourServices
 * @property {string[]} included
 * @property {string[]} excluded
 */

/**
 * @typedef {Object} MeetingPoint
 * @property {string} address
 * @property {Coordinates} coordinates
 */

/**
 * @typedef {'available' | 'full' | 'cancelled'} DateStatus
 */

/**
 * @typedef {Object} AvailableDate
 * @property {string} date - ISO date string
 * @property {number} available_slots
 * @property {number} booked_slots
 * @property {DateStatus} status
 * @property {string} [guide_id]
 */

/**
 * @typedef {'draft' | 'active' | 'inactive' | 'archived'} TourStatus
 */

/**
 * @typedef {'easy' | 'moderate' | 'challenging' | 'expert'} TourDifficulty
 */

/**
 * @typedef {Object} Tour
 * @property {string} _id
 * @property {string} provider_id
 * @property {string} title
 * @property {string[]} description
 * @property {number} price
 * @property {string} duration_hours
 * @property {string} location
 * @property {string[]} images
 * @property {TourStatus} status
 * @property {TourCapacity} capacity
 * @property {BookingInfo} booking_info
 * @property {TourPricing} pricing
 * @property {TourServices} services
 * @property {TourDifficulty} difficulty
 * @property {string[]} languages_offered
 * @property {MeetingPoint} meeting_point
 * @property {string[]} highlights
 * @property {string[]} accessibility
 * @property {AvailableDate[]} available_dates
 * @property {string} created_at - ISO date string
 * @property {string} updated_at - ISO date string
 */

/**
 * @typedef {Object} Duration
 * @property {number} days
 * @property {number} nights
 */

/**
 * @typedef {Object} TimeDuration
 * @property {number} hours
 * @property {number} minutes
 */

/**
 * @typedef {Object} Destination
 * @property {string} _id
 * @property {string} name
 * @property {string} description
 * @property {Location} location
 * @property {string[]} images
 */

/**
 * @typedef {Object} EntryFee
 * @property {number} adult
 * @property {number} child
 * @property {number} senior
 * @property {string} currency
 */

/**
 * @typedef {Object} OpeningHours
 * @property {string} open
 * @property {string} close
 */

/**
 * @typedef {'historical' | 'natural' | 'cultural' | 'religious' | 'entertainment' | 'shopping' | 'dining' | 'other'} POIType
 */

/**
 * @typedef {Object} PointOfInterest
 * @property {string} _id
 * @property {string} destinationId
 * @property {string} name
 * @property {string} description
 * @property {POIType} type
 * @property {Location} location
 * @property {EntryFee} entryFee
 * @property {Object.<string, OpeningHours>} openingHours
 * @property {TimeDuration} recommendedDuration
 * @property {string[]} images
 */

/**
 * @typedef {'sightseeing' | 'meal' | 'transportation' | 'accommodation' | 'free_time' | 'other'} ActivityType
 */

/**
 * @typedef {'planned' | 'in_progress' | 'completed' | 'cancelled'} ActivityStatus
 */

/**
 * @typedef {Object} Activity
 * @property {string} _id
 * @property {string} itineraryId
 * @property {string} title
 * @property {string} description
 * @property {ActivityType} type
 * @property {Destination} destination
 * @property {PointOfInterest[]} pointsOfInterest
 * @property {TimeDuration} duration
 * @property {string} startTime - Time string (HH:MM)
 * @property {string} endTime - Time string (HH:MM)
 * @property {number} dayNumber
 * @property {number} order
 * @property {string[]} includedServices
 * @property {string[]} images
 * @property {ActivityStatus} status
 */

/**
 * @typedef {'draft' | 'published' | 'archived'} ItineraryStatus
 */

/**
 * @typedef {Object} Itinerary
 * @property {string} _id
 * @property {string} tourId
 * @property {string} providerId
 * @property {string} title
 * @property {string} description
 * @property {Duration} duration
 * @property {Activity[]} activities
 * @property {string[]} destinations
 * @property {BudgetBreakdown[]} budget_breakdowns
 * @property {number} total_cost
 * @property {ItineraryStatus} status
 * @property {string} created_at - ISO date string
 * @property {string} updated_at - ISO date string
 */

/**
 * @typedef {'transportation' | 'accommodation' | 'meals' | 'activities' | 'guide_fees' | 'entrance_fees' | 'equipment' | 'insurance' | 'other'} BudgetCategory
 */

/**
 * @typedef {Object} Supplier
 * @property {string} name
 * @property {string} contact
 */

/**
 * @typedef {Object} BudgetBreakdown
 * @property {string} _id
 * @property {string} itinerary_id
 * @property {BudgetCategory} category
 * @property {string} item_name
 * @property {string} description
 * @property {number} quantity
 * @property {number} unit_price
 * @property {number} total_price
 * @property {string} currency
 * @property {boolean} is_optional
 * @property {boolean} is_included
 * @property {number} day_number
 * @property {string} [activity_id]
 * @property {Supplier} supplier
 */

/**
 * @typedef {Object} ParticipantsCount
 * @property {number} adults
 * @property {number} children
 * @property {number} infants
 */

/**
 * @typedef {'adult' | 'child' | 'infant'} ParticipantType
 */

/**
 * @typedef {Object} ParticipantDetail
 * @property {string} name
 * @property {number} age
 * @property {string} gender
 * @property {string} nationality
 * @property {string} id_passport
 * @property {ParticipantType} type
 */

/**
 * @typedef {Object} BookingPricing
 * @property {number} adult_price
 * @property {number} child_price
 * @property {number} infant_price
 * @property {number} subtotal
 * @property {number} discount
 * @property {number} total_amount
 */

/**
 * @typedef {'pending' | 'paid' | 'failed' | 'refunded'} PaymentStatus
 */

/**
 * @typedef {Object} PaymentInfo
 * @property {string} method
 * @property {PaymentStatus} status
 * @property {string} transaction_id
 * @property {string} paid_at - ISO date string
 */

/**
 * @typedef {Object} ContactInfo
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} emergency_contact
 */

/**
 * @typedef {'pending' | 'confirmed' | 'cancelled' | 'completed'} BookingStatus
 */

/**
 * @typedef {Object} CancellationInfo
 * @property {string} cancelled_at - ISO date string
 * @property {string} reason
 * @property {number} refund_amount
 * @property {string} refund_status
 */

/**
 * @typedef {Object} Booking
 * @property {string} _id
 * @property {string} booking_number
 * @property {string} tour_id
 * @property {string} tour_date - ISO date string
 * @property {string} customer_id
 * @property {string} provider_id
 * @property {ParticipantsCount} participants
 * @property {ParticipantDetail[]} participant_details
 * @property {BookingPricing} pricing
 * @property {PaymentInfo} payment
 * @property {ContactInfo} contact_info
 * @property {string} special_requests
 * @property {BookingStatus} status
 * @property {CancellationInfo} [cancellation]
 * @property {string} created_at - ISO date string
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} totalTours
 * @property {number} activeTours
 * @property {number} totalBookings
 * @property {number} pendingBookings
 * @property {number} totalRevenue
 * @property {number} monthlyRevenue
 * @property {number} averageRating
 * @property {number} totalReviews
 */

/**
 * @typedef {Object} RecentBooking
 * @property {string} _id
 * @property {string} booking_number
 * @property {string} tour_title
 * @property {string} customer_name
 * @property {string} tour_date
 * @property {number} total_amount
 * @property {BookingStatus} status
 * @property {string} created_at
 */

/**
 * @typedef {Object} ProviderDashboardData
 * @property {DashboardStats} stats
 * @property {RecentBooking[]} recentBookings
 * @property {Object[]} revenueChart
 * @property {Object[]} bookingTrends
 */

export {};
