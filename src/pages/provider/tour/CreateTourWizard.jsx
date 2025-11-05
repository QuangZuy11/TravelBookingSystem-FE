import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import BasicInfoForm from './components/BasicInfoForm';
import ItineraryForm from './components/ItineraryForm';
import './CreateTourWizard.css';

const CreateTourWizard = () => {
    const navigate = useNavigate();
    const { tourId: editTourId } = useParams(); // Get tourId from URL for edit mode
    const isEditMode = !!editTourId;

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(isEditMode);
    const [tourData, setTourData] = useState({
        tourId: null,
        basicInfo: null,
        itineraries: []
    });

    // Get provider _id from localStorage
    const provider = localStorage.getItem('provider')
        ? JSON.parse(localStorage.getItem('provider'))
        : null;
    const providerId = provider?._id || null;

    const token = localStorage.getItem('token');

    console.log('🔐 CreateTourWizard - Provider Info:', {
        provider,
        providerId,
        isEditMode,
        editTourId
    });

    // Load tour data for edit mode
    useEffect(() => {
        const loadTourData = async () => {
            if (!isEditMode || !editTourId) return;

            try {
                setLoading(true);

                // 1. Load basic tour info
                const tourResponse = await axios.get(
                    `http://localhost:3000/api/tour/provider/${providerId}/tours/${editTourId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }
                );
                const tourInfo = tourResponse.data.data;

                // 2. Load itineraries with activities
                const itinerariesResponse = await axios.get(
                    `http://localhost:3000/api/itineraries/tour/${editTourId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }
                );
                const itinerariesData = itinerariesResponse.data.data || [];

                console.log('📋 Loaded itineraries:', itinerariesData);

                // Load activities for each itinerary
                const itinerariesWithActivities = await Promise.all(
                    itinerariesData.map(async (itinerary) => {
                        try {
                            const activitiesResponse = await axios.get(
                                `http://localhost:3000/api/itineraries/${itinerary._id}/activities`, {
                                headers: { Authorization: `Bearer ${token}` }
                            }
                            );
                            return {
                                ...itinerary,
                                activities: activitiesResponse.data.data || []
                            };
                        } catch (error) {
                            console.error(`Error loading activities for itinerary ${itinerary._id}:`, error);
                            return {
                                ...itinerary,
                                activities: []
                            };
                        }
                    })
                );

                console.log('✅ Itineraries with activities:', itinerariesWithActivities);

                // Set loaded data
                setTourData({
                    tourId: editTourId,
                    basicInfo: tourInfo,
                    itineraries: itinerariesWithActivities
                });

                console.log('💾 Final tourData set:', {
                    tourId: editTourId,
                    basicInfo: tourInfo,
                    itinerariesCount: itinerariesWithActivities.length
                });

                toast.success('Đã tải dữ liệu tour!');
            } catch (error) {
                console.error('Error loading tour data:', error);
                toast.error('Không thể tải dữ liệu tour. Vui lòng thử lại!');
                navigate('/provider/tours');
            } finally {
                setLoading(false);
            }
        };

        loadTourData();
    }, [isEditMode, editTourId, providerId, navigate]);

    const handleBasicInfoComplete = (data) => {
        console.log('💾 Saving basic info:', data);
        setTourData(prev => ({
            ...prev,
            tourId: data.tourId,
            basicInfo: data.basicInfo
        }));
        setCurrentStep(2);
        toast.success('Thông tin cơ bản đã được lưu!');
    };

    const handleItineraryComplete = async (data) => {
        console.log('💾 Saving itinerary:', data);
        setTourData(prev => ({
            ...prev,
            itineraries: data.itineraries
        }));

        toast.success('Tạo tour thành công!');

        // Redirect to tour list or tour details
        setTimeout(() => {
            navigate(`/provider/tours/${tourData.tourId}`);
        }, 1500);
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            // Data is preserved in tourData state via callbacks
        }
    };

    const handleBackFromItinerary = (currentItineraries) => {
        // Save current itineraries before going back
        console.log('⬅️ Going back from itinerary. Current itineraries:', currentItineraries);
        setTourData(prev => {
            const updated = {
                ...prev,
                itineraries: currentItineraries
            };
            console.log('💾 Updated tourData:', updated);
            return updated;
        });
        setCurrentStep(1);
    };

    const steps = [
        { number: 1, title: 'Thông tin cơ bản', icon: '📝' },
        { number: 2, title: 'Lịch trình & Hoạt động', icon: '📅' }
    ];

    // Show loading state while fetching data in edit mode
    if (loading) {
        return (
            <div className="create-tour-wizard">
                <div className="wizard-container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu tour...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="create-tour-wizard">
            <div className="wizard-container">
                {/* Header */}
                <div className="wizard-header">
                    <h1 className="wizard-title">{isEditMode ? 'Chỉnh sửa Tour' : 'Tạo Tour Mới'}</h1>
                    <p className="wizard-subtitle">
                        {isEditMode ? 'Cập nhật thông tin tour của bạn' : 'Tạo tour chuyên nghiệp trong 3 bước đơn giản'}
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="step-indicator">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.number}>
                            <div className="step-item">
                                <div className={`step-circle ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
                                    {currentStep > step.number ? '✓' : step.icon}
                                </div>
                                <div className="step-info">
                                    <span className="step-number">Bước {step.number}</span>
                                    <span className="step-title">{step.title}</span>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`step-line ${currentStep > step.number ? 'active' : ''}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Form Content */}
                <div className="wizard-content">
                    {currentStep === 1 && (
                        <BasicInfoForm
                            providerId={providerId}
                            initialData={tourData.basicInfo}
                            isEditMode={isEditMode}
                            onNext={handleBasicInfoComplete}
                            onCancel={() => navigate('/provider/tours')}
                        />
                    )}

                    {currentStep === 2 && (
                        <ItineraryForm
                            tourId={tourData.tourId}
                            basicInfo={tourData.basicInfo}
                            existingItineraries={tourData.itineraries}
                            isEditMode={isEditMode}
                            onNext={handleItineraryComplete}
                            onBack={handleBackFromItinerary}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateTourWizard;
