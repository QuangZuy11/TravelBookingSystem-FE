import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerServiceProvider } from '../../services/serviceProviderService';
import {
    validateServiceProviderLicenses,
    canAddLicense,
    canRemoveLicense,
    getLicensesByType,
    getServiceTypeDisplay,
    isValidLicenseFormat,
    getErrorMessage
} from '../../utils/licenseValidation';
import './ServiceProviderRegistration.css';

const ServiceProviderRegistration = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Company Information (không cần user info vì đã login rồi)
    const [companyInfo, setCompanyInfo] = useState({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: ''
    });

    // Step 2: Service Types
    const [serviceTypes, setServiceTypes] = useState([]);

    // Step 3: Licenses
    const [licenses, setLicenses] = useState([]);

    // ==================== STEP NAVIGATION ====================

    const nextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    // ==================== VALIDATION ====================

    const validateCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return validateCompanyInfo();
            case 2:
                return validateServiceTypes();
            case 3:
                return validateLicenses();
            default:
                return true;
        }
    };

    const validateCompanyInfo = () => {
        if (!companyInfo.company_name || !companyInfo.contact_person ||
            !companyInfo.email || !companyInfo.phone || !companyInfo.address) {
            toast.error('Vui lòng điền đầy đủ thông tin công ty!');
            console.log('Validation failed - missing fields:', companyInfo);
            return false;
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(companyInfo.email)) {
            toast.error('Email công ty không hợp lệ!');
            return false;
        }
        // Validate phone format (basic)
        if (companyInfo.phone.length < 10) {
            toast.error('Số điện thoại phải có ít nhất 10 số!');
            return false;
        }
        console.log('Company info validation passed:', companyInfo);
        return true;
    };

    const validateServiceTypes = () => {
        if (serviceTypes.length === 0) {
            toast.error('Vui lòng chọn 1 loại dịch vụ!');
            return false;
        }
        if (serviceTypes.length > 1) {
            toast.error('⚠️ Chỉ được chọn 1 loại dịch vụ duy nhất!');
            return false;
        }
        return true;
    };

    const validateLicenses = () => {
        const validation = validateServiceProviderLicenses(serviceTypes, licenses);
        if (!validation.valid) {
            validation.errors.forEach(error => toast.error(error));
            return false;
        }
        return true;
    };

    // ==================== HANDLERS ====================

    const handleCompanyInfoChange = (e) => {
        setCompanyInfo({
            ...companyInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleServiceTypeChange = (type) => {
        // ✅ CHỈ ĐƯỢC CHỌN 1 LOẠI DUY NHẤT - thay thế hoàn toàn
        if (serviceTypes.includes(type)) {
            // Nếu click vào loại đã chọn -> bỏ chọn
            setServiceTypes([]);
            setLicenses([]);
        } else {
            // Chọn loại mới -> xóa tất cả loại cũ và licenses cũ
            setServiceTypes([type]);
            // Add default license cho loại mới
            setLicenses([{
                service_type: type,
                license_number: '',
                documents: []
            }]);

            toast.success(`✅ Đã chọn dịch vụ: ${getServiceTypeDisplay(type)}`);
        }
    };

    const handleAddLicense = (serviceType) => {
        // Tất cả service type chỉ được có 1 license duy nhất
        const existingLicenses = getLicensesByType(licenses, serviceType);
        if (existingLicenses.length >= 1) {
            toast.error(`${getServiceTypeDisplay(serviceType)} chỉ có thể có 1 license duy nhất!`);
            return;
        }

        setLicenses([...licenses, {
            service_type: serviceType,
            license_number: '',
            documents: []
        }]);

        toast.success('Đã thêm license mới cho khách sạn');
    };

    const handleRemoveLicense = (index, serviceType) => {
        const licensesOfType = getLicensesByType(licenses, serviceType);

        if (!canRemoveLicense(serviceType, licensesOfType.length)) {
            toast.error(`${getServiceTypeDisplay(serviceType)} phải có ít nhất 1 license!`);
            return;
        }

        setLicenses(licenses.filter((_, i) => i !== index));
    };

    const handleLicenseChange = (index, field, value) => {
        const updatedLicenses = [...licenses];
        updatedLicenses[index] = {
            ...updatedLicenses[index],
            [field]: value
        };
        setLicenses(updatedLicenses);
    };



    // ==================== SUBMIT ====================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateLicenses()) return;

        setLoading(true);

        try {
            // Data theo đúng backend schema
            const data = {
                company_name: companyInfo.company_name,
                contact_person: companyInfo.contact_person,
                company_email: companyInfo.email, // Backend expects 'company_email'
                company_phone: companyInfo.phone, // Backend expects 'company_phone'
                address: companyInfo.address,
                type: serviceTypes, // Array of service types
                licenses: licenses  // Array of license objects
            };

            console.log('Sending registration data:', data); // Debug log

            const response = await registerServiceProvider(data);

            if (response.success) {
                const providerData = response.data.provider;

                // Update localStorage với provider data mới (đầy đủ)
                localStorage.setItem('provider', JSON.stringify(providerData));
                localStorage.setItem('providerId', providerData._id);

                // Update user object in localStorage
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        user.providerId = providerData._id;
                        user.provider = providerData;
                        localStorage.setItem('user', JSON.stringify(user));
                    } catch (error) {
                        console.error('Error updating user in localStorage:', error);
                    }
                }

                toast.success('✅ Đăng ký thành công! Chờ admin xác minh.');

                // Redirect to pending verification page
                setTimeout(() => {
                    navigate('/provider/pending-verification');
                }, 1500);
            }
        } catch (error) {
            console.error('Registration error:', error);
            const errorMsg = error.response?.data?.message || error.message;
            toast.error(getErrorMessage(errorMsg));
        } finally {
            setLoading(false);
        }
    };

    // ==================== RENDER STEPS ====================

    const renderStep1 = () => (
        <div className="registration-step">
            <h2>Bước 1: Thông tin công ty</h2>
            <p className="step-description">Thông tin về công ty/doanh nghiệp của bạn</p>

            <div className="form-grid">
                <div className="form-group full-width">
                    <label>Tên công ty *</label>
                    <input
                        type="text"
                        name="company_name"
                        placeholder="VD: Công ty Du lịch Việt"
                        value={companyInfo.company_name}
                        onChange={handleCompanyInfoChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Người liên hệ *</label>
                    <input
                        type="text"
                        name="contact_person"
                        placeholder="Nguyễn Văn A"
                        value={companyInfo.contact_person}
                        onChange={handleCompanyInfoChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email công ty (Company Email) *</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="company@example.com"
                        value={companyInfo.email}
                        onChange={handleCompanyInfoChange}
                        required
                    />
                    <small className="hint">Email chính thức của công ty</small>
                </div>

                <div className="form-group">
                    <label>Số điện thoại công ty (Company Phone) *</label>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="0123456789"
                        value={companyInfo.phone}
                        onChange={handleCompanyInfoChange}
                        required
                    />
                    <small className="hint">Số điện thoại liên hệ của công ty</small>
                </div>

                <div className="form-group full-width">
                    <label>Địa chỉ *</label>
                    <textarea
                        name="address"
                        placeholder="Địa chỉ đầy đủ của công ty"
                        value={companyInfo.address}
                        onChange={handleCompanyInfoChange}
                        rows="3"
                        required
                    />
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="registration-step">
            <h2>Bước 2: Chọn loại dịch vụ</h2>
            <p className="step-description">⚠️ <strong>Chỉ được chọn 1 loại dịch vụ duy nhất</strong></p>

            <div className="service-types">
                <label className="service-type-card">
                    <input
                        type="radio"
                        name="serviceType"
                        value="hotel"
                        checked={serviceTypes.includes('hotel')}
                        onChange={() => handleServiceTypeChange('hotel')}
                    />
                    <div className="service-type-content">
                        <span className="service-icon">🏨</span>
                        <span className="service-name">Khách sạn</span>
                        <small className="service-hint">Có thể có nhiều licenses</small>
                    </div>
                </label>

                <label className="service-type-card">
                    <input
                        type="radio"
                        name="serviceType"
                        value="tour"
                        checked={serviceTypes.includes('tour')}
                        onChange={() => handleServiceTypeChange('tour')}
                    />
                    <div className="service-type-content">
                        <span className="service-icon">🗺️</span>
                        <span className="service-name">Tour</span>
                        <small className="service-hint">Chỉ 1 license duy nhất</small>
                    </div>
                </label>

            </div>

            {serviceTypes.length === 0 && (
                <p className="warning-text">⚠️ Vui lòng chọn 1 loại dịch vụ</p>
            )}
        </div>
    );

    const renderStep4 = () => (
        <div className="registration-step">
            <h2>Bước 3: Giấy phép kinh doanh</h2>
            <p className="step-description">Nhập số giấy phép kinh doanh cho loại dịch vụ đã chọn</p>

            <div className="licenses-section">
                {serviceTypes.map(serviceType => {
                    const licensesOfType = getLicensesByType(licenses, serviceType);

                    return (
                        <div key={serviceType} className="license-group">
                            <div className="license-group-header">
                                <h3>
                                    {getServiceTypeDisplay(serviceType)}
                                    {serviceType === 'hotel' && (
                                        <span className="license-badge limited">Chỉ 1 license duy nhất</span>
                                    )}
                                    {(serviceType === 'tour') && (
                                        <span className="license-badge limited">Chỉ 1 license duy nhất</span>
                                    )}
                                </h3>


                            </div>

                            {licensesOfType.map((license, idx) => {
                                const globalIndex = licenses.findIndex(l => l === license);

                                return (
                                    <div key={globalIndex} className="license-item">
                                        <div className="license-item-header">
                                            <span className="license-number-label">
                                                {serviceType === 'hotel'
                                                    ? `Khách sạn #${idx + 1}`
                                                    : `License #${idx + 1}`
                                                }
                                            </span>
                                            {/* Chỉ hotel mới cho phép xóa license (nếu có > 1) */}
                                            {serviceType === 'hotel' && licensesOfType.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLicense(globalIndex, serviceType)}
                                                    className="btn-remove-license"
                                                >
                                                    ❌ Xóa khách sạn này
                                                </button>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Số giấy phép {serviceType === 'hotel' ? 'kinh doanh khách sạn' : 'kinh doanh'} *
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={
                                                    serviceType === 'hotel' ? "VD: HTL-2024-001" :
                                                        serviceType === 'tour' ? "VD: TUR-2024-001" :
                                                            "VD: FLT-2024-001"
                                                }
                                                value={license.license_number}
                                                onChange={(e) => handleLicenseChange(globalIndex, 'license_number', e.target.value)}
                                                className={license.license_number && !isValidLicenseFormat(license.license_number) ? 'input-error' : ''}
                                                required
                                            />
                                            <small className="hint">
                                                {serviceType === 'hotel' && '🏨 Mỗi khách sạn cần 1 giấy phép riêng'}
                                                {serviceType === 'tour' && '🗺️ Giấy phép kinh doanh tour du lịch'}
                                            </small>
                                            {license.license_number && !isValidLicenseFormat(license.license_number) && (
                                                <small className="error-text">❌ Format: XXX-YYYY-NNN (VD: HTL-2024-001)</small>
                                            )}
                                        </div>


                                    </div>
                                );
                            })}

                            {/* Info box with business rules */}
                            <div className={`license-info-box ${serviceType}`}>
                                {serviceType === 'hotel' && (
                                    <>
                                        <div className="info-icon">🏨</div>
                                        <div className="info-content">
                                            <strong>Quy định về license Hotel:</strong>
                                            <ul>
                                                <li>🏢 Mỗi nhà cung cấp chỉ được đăng ký <strong>1 giấy phép duy nhất</strong></li>
                                                <li>� Sau khi đăng ký thành công, chỉ có thể tạo <strong>1 khách sạn</strong></li>
                                                <li>📄 Phải có giấy phép hợp lệ từ cơ quan quản lý</li>
                                            </ul>
                                        </div>
                                    </>
                                )}
                                {serviceType === 'tour' && (
                                    <>
                                        <div className="info-icon">🗺️</div>
                                        <div className="info-content">
                                            <strong>Quy định về license Tour:</strong>
                                            <ul>
                                                <li>⚠️ Chỉ được có <strong>1 LICENSE DUY NHẤT</strong></li>
                                                <li>🎫 1 giấy phép kinh doanh tour du lịch</li>
                                                <li>📄 Cấp bởi Sở Du lịch địa phương</li>
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // ==================== RENDER ====================

    return (
        <div className="service-provider-registration">
            <div className="registration-container">
                {/* Header */}
                <div className="registration-header">
                    <h1>Đăng ký Service Provider</h1>
                    <p>Trở thành đối tác cung cấp dịch vụ của VietTravel</p>
                </div>

                {/* Progress Steps */}
                <div className="progress-steps">
                    <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                        <div className="step-circle">1</div>
                        <div className="step-label">Công ty</div>
                    </div>
                    <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                        <div className="step-circle">2</div>
                        <div className="step-label">Dịch vụ</div>
                    </div>
                    <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                        <div className="step-circle">3</div>
                        <div className="step-label">Giấy phép</div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="registration-form">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep4()}

                    {/* Navigation Buttons */}
                    <div className="form-actions">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                ← Quay lại
                            </button>
                        )}

                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="btn-primary"
                            >
                                Tiếp theo →
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : '✅ Hoàn tất đăng ký'}
                            </button>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="registration-footer">
                    <p>
                        Đã có tài khoản? <a href="/auth">Đăng nhập ngay</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ServiceProviderRegistration;
