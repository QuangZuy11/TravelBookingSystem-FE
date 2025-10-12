import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { addLicense, uploadLicenseDocuments } from '../../services/serviceProviderService';
import { isValidLicenseFormat } from '../../utils/licenseValidation';
import './AddHotelLicenseModal.css';

const AddHotelLicenseModal = ({ isOpen, onClose, providerId, onSuccess }) => {
    const [licenseNumber, setLicenseNumber] = useState('');
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                // Validate file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    throw new Error(`File ${file.name} quá lớn. Tối đa 10MB.`);
                }
                formData.append('files', file);
            });

            const urls = await uploadLicenseDocuments(formData);
            setDocuments([...documents, ...urls]);
            toast.success('Upload thành công!');
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Upload thất bại. Vui lòng thử lại.');
            toast.error(err.message || 'Upload thất bại');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveDocument = (index) => {
        setDocuments(documents.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (!licenseNumber.trim()) {
            setError('Vui lòng nhập license number');
            setLoading(false);
            return;
        }

        if (!isValidLicenseFormat(licenseNumber)) {
            setError('License number phải có format: XXX-YYYY-NNN (VD: HTL-2024-001)');
            setLoading(false);
            return;
        }

        if (documents.length === 0) {
            setError('Vui lòng upload ít nhất 1 tài liệu giấy phép');
            setLoading(false);
            return;
        }

        try {
            const response = await addLicense(providerId, {
                service_type: 'hotel',
                license_number: licenseNumber.trim(),
                documents: documents
            });

            if (response.success) {
                toast.success('✅ Thêm khách sạn thành công!');
                onSuccess();
            }
        } catch (err) {
            console.error('Add license error:', err);
            const errorMsg = err.response?.data?.message || err.message;
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content add-hotel-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2>➕ Thêm khách sạn mới</h2>
                    <button onClick={onClose} className="modal-close" disabled={loading}>
                        ✕
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="modal-body">
                    {/* License Number */}
                    <div className="form-group">
                        <label>
                            License Number <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="VD: HTL-2024-001"
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            className={licenseNumber && !isValidLicenseFormat(licenseNumber) ? 'input-error' : ''}
                            required
                            disabled={loading}
                        />
                        <small className="hint">
                            ⚠️ License number phải unique trong toàn hệ thống
                        </small>
                        <small className="hint">
                            Format: XXX-YYYY-NNN (VD: HTL-2024-001)
                        </small>
                        {licenseNumber && !isValidLicenseFormat(licenseNumber) && (
                            <small className="error-text">❌ Format không hợp lệ</small>
                        )}
                    </div>

                    {/* Documents Upload */}
                    <div className="form-group">
                        <label>
                            Tài liệu giấy phép <span className="required">*</span>
                        </label>
                        <div className="file-upload-container">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                disabled={uploading || loading}
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="file-input"
                            />
                            <button
                                type="button"
                                className="btn-upload"
                                onClick={() => document.querySelector('.file-input').click()}
                                disabled={uploading || loading}
                            >
                                {uploading ? '⏳ Đang upload...' : '📁 Chọn file'}
                            </button>
                        </div>
                        <small className="hint">
                            Upload các file scan giấy phép (PDF, JPG, PNG)
                        </small>
                        <small className="hint">
                            Tối đa 10MB mỗi file
                        </small>
                    </div>

                    {/* Uploaded Documents List */}
                    {documents.length > 0 && (
                        <div className="uploaded-documents">
                            <label>Tài liệu đã upload ({documents.length}):</label>
                            <ul className="documents-list">
                                {documents.map((doc, index) => (
                                    <li key={index} className="document-item">
                                        <a href={doc} target="_blank" rel="noopener noreferrer" className="document-link">
                                            <span className="doc-icon">📄</span>
                                            <span className="doc-name">Document {index + 1}</span>
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDocument(index)}
                                            className="btn-remove-doc"
                                            disabled={loading}
                                            title="Xóa tài liệu"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            ❌ {error}
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="info-box">
                        <p>
                            <strong>📌 Lưu ý:</strong>
                        </p>
                        <ul>
                            <li>License number phải đúng format và chưa được đăng ký trước đó</li>
                            <li>Mỗi khách sạn cần 1 license riêng biệt</li>
                            <li>Giấy phép sẽ được admin xác minh trong 1-3 ngày làm việc</li>
                            <li>Chỉ sau khi được xác minh mới có thể quản lý khách sạn</li>
                        </ul>
                    </div>
                </form>

                {/* Footer */}
                <div className="modal-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="btn-secondary"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading || uploading || documents.length === 0 || !licenseNumber.trim()}
                        className="btn-primary"
                    >
                        {loading ? '⏳ Đang xử lý...' : '✅ Thêm khách sạn'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddHotelLicenseModal;
