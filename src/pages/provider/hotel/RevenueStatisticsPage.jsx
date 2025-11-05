import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import {
    ArrowLeft,
    DollarSign,
    TrendingUp,
    Calendar,
    Download,
    RefreshCcw
} from 'lucide-react';
import {
    formatCurrency,
    getDailyStatistics,
    getMonthlyStatistics,
    getYearlyStatistics
} from '../../../services/bookingService';

// Add CSS for spin animation
const spinAnimation = `
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;

const RevenueStatisticsPage = () => {
    const navigate = useNavigate();
    const [timeFilter, setTimeFilter] = useState('month'); // day, month, year
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState([]);

    // Fetch revenue statistics from API
    const fetchRevenueData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let response;
            let formattedData = [];

            if (timeFilter === 'day') {
                // Daily: Fetch month data
                response = await getDailyStatistics({
                    year: selectedYear,
                    month: selectedMonth
                });

                // Format daily data
                const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                formattedData = response.data.map(item => {
                    const date = new Date(item.date);
                    const dayOfWeek = dayNames[date.getDay()];
                    const day = date.getDate();
                    return {
                        name: `${day}/${selectedMonth}`,
                        fullDate: item.date,
                        dayOfWeek,
                        revenue: item.revenue || 0,
                        bookings: item.bookings || 0
                    };
                });
            } else if (timeFilter === 'month') {
                // Monthly: Fetch year data
                response = await getMonthlyStatistics({
                    year: selectedYear
                });

                // Format monthly data
                const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
                formattedData = response.data.map(item => ({
                    name: monthNames[item.month_number - 1],
                    month: item.month,
                    revenue: item.revenue || 0,
                    bookings: item.bookings || 0
                }));
            } else if (timeFilter === 'year') {
                // Yearly: Fetch multi-year data
                const currentYear = new Date().getFullYear();
                response = await getYearlyStatistics({
                    start_year: currentYear - 4,
                    end_year: currentYear
                });

                // Format yearly data
                formattedData = response.data.map(item => ({
                    name: `${item.year}`,
                    year: item.year,
                    revenue: item.revenue || 0,
                    bookings: item.bookings || 0
                }));
            }

            setChartData(formattedData);
        } catch (err) {
            console.error('Error fetching revenue data:', err);
            setError(err.message || 'Không thể tải dữ liệu thống kê');
            setChartData([]);
        } finally {
            setLoading(false);
        }
    }, [timeFilter, selectedMonth, selectedYear]);

    // Fetch data when filters change
    useEffect(() => {
        fetchRevenueData();
    }, [fetchRevenueData]);

    // Calculate totals
    const totalRevenue = chartData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalBookings = chartData.reduce((sum, item) => sum + (item.bookings || 0), 0);
    const avgRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '2px solid #0a5757'
                }}>
                    <p style={{ margin: 0, fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                        {payload[0].payload.name}
                    </p>
                    <p style={{ margin: 0, color: '#0a5757', fontSize: '0.875rem' }}>
                        Doanh thu: {formatCurrency(payload[0].value)}
                    </p>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                        Bookings: {payload[0].payload.bookings}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            {/* Inject CSS animation */}
            <style>{spinAnimation}</style>

            <div style={{ padding: '2rem', background: '#f8f9fa', minHeight: '100vh' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate('/provider/bookings')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'white',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#6b7280',
                            marginBottom: '1rem',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#0a5757';
                            e.currentTarget.style.color = '#0a5757';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.color = '#6b7280';
                        }}
                    >
                        <ArrowLeft size={18} />
                        Quay lại
                    </button>

                    <h1 style={{
                        margin: 0,
                        fontSize: '1.875rem',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        marginBottom: '0.5rem'
                    }}>
                        Thống kê Doanh thu
                    </h1>
                    <p style={{ margin: 0, color: '#6b7280' }}>
                        Xem chi tiết doanh thu theo tuần, tháng, năm
                    </p>
                </div>

                {/* Stats Summary Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '2px solid #e5e7eb'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #0a5757 0%, #2d6a4f 100%)',
                                borderRadius: '12px',
                                padding: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <DollarSign size={24} color="white" />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                                    Tổng doanh thu
                                </p>
                            </div>
                        </div>
                        <p style={{
                            margin: 0,
                            fontSize: '1.875rem',
                            fontWeight: '700',
                            color: '#0a5757'
                        }}>
                            {formatCurrency(totalRevenue)}
                        </p>
                    </div>

                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '2px solid #e5e7eb'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                background: '#e8f5e9',
                                borderRadius: '12px',
                                padding: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TrendingUp size={24} color="#0a5757" />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                                    Doanh thu TB
                                </p>
                            </div>
                        </div>
                        <p style={{
                            margin: 0,
                            fontSize: '1.875rem',
                            fontWeight: '700',
                            color: '#0a5757'
                        }}>
                            {formatCurrency(avgRevenue)}
                        </p>
                    </div>

                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '2px solid #e5e7eb'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                background: '#fff3e0',
                                borderRadius: '12px',
                                padding: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Calendar size={24} color="#f59e0b" />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                                    Tổng bookings
                                </p>
                            </div>
                        </div>
                        <p style={{
                            margin: 0,
                            fontSize: '1.875rem',
                            fontWeight: '700',
                            color: '#0a5757'
                        }}>
                            {totalBookings}
                        </p>
                    </div>
                </div>

                {/* Chart Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                    {/* Chart Controls */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2rem',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#1a1a1a'
                        }}>
                            Biểu đồ doanh thu
                        </h2>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Time Filter Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                background: '#f3f4f6',
                                padding: '0.25rem',
                                borderRadius: '8px'
                            }}>
                                {['day', 'month', 'year'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setTimeFilter(filter)}
                                        disabled={loading}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            border: 'none',
                                            borderRadius: '6px',
                                            background: timeFilter === filter ? '#0a5757' : 'transparent',
                                            color: timeFilter === filter ? 'white' : '#6b7280',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            transition: 'all 0.2s ease',
                                            opacity: loading ? 0.5 : 1
                                        }}
                                    >
                                        {filter === 'day' ? 'Ngày' : filter === 'month' ? 'Tháng' : 'Năm'}
                                    </button>
                                ))}
                            </div>

                            {/* Date Selectors */}
                            {timeFilter === 'day' && (
                                <>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                        disabled={loading}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            paddingRight: '2.5rem',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            background: 'white',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            appearance: 'none',
                                            opacity: loading ? 0.5 : 1
                                        }}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                            <option key={month} value={month}>Tháng {month}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        disabled={loading}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            paddingRight: '2.5rem',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            background: 'white',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            appearance: 'none',
                                            opacity: loading ? 0.5 : 1
                                        }}
                                    >
                                        {[2023, 2024, 2025, 2026].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </>
                            )}

                            {timeFilter === 'month' && (
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    disabled={loading}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        paddingRight: '2.5rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        background: 'white',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        appearance: 'none',
                                        opacity: loading ? 0.5 : 1
                                    }}
                                >
                                    {[2023, 2024, 2025, 2026].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            )}

                            {/* Refresh Button */}
                            <button
                                onClick={fetchRevenueData}
                                disabled={loading}
                                style={{
                                    padding: '0.5rem 1rem',
                                    border: '2px solid #6b7280',
                                    borderRadius: '8px',
                                    background: 'white',
                                    color: '#6b7280',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s ease',
                                    opacity: loading ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.background = '#6b7280';
                                        e.currentTarget.style.color = 'white';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.background = 'white';
                                        e.currentTarget.style.color = '#6b7280';
                                    }
                                }}
                            >
                                <RefreshCcw
                                    size={16}
                                    style={{
                                        animation: loading ? 'spin 1s linear infinite' : 'none'
                                    }}
                                />
                                {loading ? 'Đang tải...' : 'Làm mới'}
                            </button>

                            {/* Export Button */}
                            <button
                                style={{
                                    padding: '0.5rem 1rem',
                                    border: '2px solid #0a5757',
                                    borderRadius: '8px',
                                    background: 'white',
                                    color: '#0a5757',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#0a5757';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.color = '#0a5757';
                                }}
                            >
                                <Download size={16} />
                                Xuất Excel
                            </button>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div style={{
                            padding: '2rem',
                            background: '#fef2f2',
                            borderRadius: '8px',
                            border: '2px solid #fecaca',
                            marginBottom: '1rem'
                        }}>
                            <p style={{ margin: 0, color: '#dc2626', fontWeight: '500' }}>
                                ⚠️ {error}
                            </p>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '400px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    border: '4px solid #e5e7eb',
                                    borderTop: '4px solid #0a5757',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 1rem'
                                }}></div>
                                <p style={{ margin: 0, color: '#6b7280' }}>Đang tải dữ liệu...</p>
                            </div>
                        </div>
                    )}

                    {/* Chart - Only show when not loading and no error */}
                    {!loading && !error && chartData.length > 0 && (
                        <ResponsiveContainer width="100%" height={400}>
                            {timeFilter === 'day' ? (
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#6b7280"
                                        style={{ fontSize: '0.875rem' }}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        style={{ fontSize: '0.875rem' }}
                                        tickFormatter={(value) => `${(value / 1000)}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ fontSize: '0.875rem', paddingTop: '1rem' }}
                                        formatter={(value) => value === 'revenue' ? 'Doanh thu (VNĐ)' : value}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#0a5757"
                                        strokeWidth={2}
                                        dot={{ fill: '#0a5757', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            ) : (
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#6b7280"
                                        style={{ fontSize: '0.875rem' }}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        style={{ fontSize: '0.875rem' }}
                                        tickFormatter={(value) => `${(value / 1000)}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ fontSize: '0.875rem', paddingTop: '1rem' }}
                                        formatter={(value) => value === 'revenue' ? 'Doanh thu (VNĐ)' : value}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="url(#colorRevenue)"
                                        radius={[8, 8, 0, 0]}
                                    />
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#0a5757" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#2d6a4f" stopOpacity={0.8} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    )}

                    {/* Empty State */}
                    {!loading && !error && chartData.length === 0 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '400px',
                            background: '#f9fafb',
                            borderRadius: '8px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <Calendar size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
                                <p style={{ margin: 0, color: '#6b7280', fontSize: '1rem' }}>
                                    Không có dữ liệu trong khoảng thời gian này
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Chart Footer Info - Only show when there's data */}
                    {!loading && !error && chartData.length > 0 && (
                        <div style={{
                            marginTop: '2rem',
                            padding: '1rem',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                    Cao nhất
                                </p>
                                <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#0a5757' }}>
                                    {formatCurrency(Math.max(...chartData.map(d => d.revenue)))}
                                </p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                    Thấp nhất
                                </p>
                                <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#ef4444' }}>
                                    {formatCurrency(Math.min(...chartData.map(d => d.revenue)))}
                                </p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                    Trung bình
                                </p>
                                <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#6b7280' }}>
                                    {formatCurrency(avgRevenue)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default RevenueStatisticsPage;
