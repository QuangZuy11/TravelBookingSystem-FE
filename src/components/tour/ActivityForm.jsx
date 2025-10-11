import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '@components/shared/Modal';
import Input from '@components/common/Input';
import Select from '@components/common/Select';
import Button from '@components/common/Button';
import { Clock, MapPin, Save, X } from 'lucide-react';

// Validation schema
const activitySchema = yup.object().shape({
    title: yup.string().required('Tiêu đề là bắt buộc'),
    description: yup.string().required('Mô tả là bắt buộc'),
    type: yup.string().required('Loại hoạt động là bắt buộc'),
    startTime: yup.string().required('Thời gian bắt đầu là bắt buộc'),
    endTime: yup.string().required('Thời gian kết thúc là bắt buộc'),
    destination: yup.string(),
});

/**
 * Activity Form Component
 * Form for creating/editing tour activities
 * 
 * @param {Object} props
 * @param {Object} props.activity - Activity data for editing
 * @param {number} props.dayNumber - Day number
 * @param {Function} props.onSave - Save handler
 * @param {Function} props.onCancel - Cancel handler
 */
const ActivityForm = ({ activity, dayNumber, onSave, onCancel }) => {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(activitySchema),
        defaultValues: activity || {
            title: '',
            description: '',
            type: 'sightseeing',
            startTime: '09:00',
            endTime: '12:00',
            destination: '',
            dayNumber,
        },
    });

    useEffect(() => {
        if (activity) {
            reset(activity);
        }
    }, [activity, reset]);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await onSave(data);
        } catch (error) {
            console.error('Error saving activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const activityTypes = [
        { value: 'sightseeing', label: '🏛️ Tham quan' },
        { value: 'meal', label: '🍽️ Ăn uống' },
        { value: 'transportation', label: '🚗 Di chuyển' },
        { value: 'accommodation', label: '🏨 Nghỉ ngơi' },
        { value: 'free_time', label: '🕐 Tự do' },
        { value: 'other', label: '📋 Khác' },
    ];

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title={activity ? 'Sửa Hoạt Động' : 'Thêm Hoạt Động Mới'}
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Title */}
                <Input
                    label="Tiêu Đề Hoạt Động"
                    placeholder="VD: Tham quan Hồ Hoàn Kiếm"
                    {...register('title')}
                    error={errors.title?.message}
                    required
                />

                {/* Description */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Mô Tả <span className="text-danger-500">*</span>
                    </label>
                    <textarea
                        {...register('description')}
                        rows={4}
                        className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Mô tả chi tiết hoạt động..."
                    />
                    {errors.description && (
                        <p className="mt-1.5 text-sm text-danger-600">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                {/* Type */}
                <Select
                    label="Loại Hoạt Động"
                    {...register('type')}
                    options={activityTypes}
                    error={errors.type?.message}
                    required
                />

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Thời Gian Bắt Đầu"
                        type="time"
                        {...register('startTime')}
                        error={errors.startTime?.message}
                        icon={<Clock className="w-5 h-5" />}
                        required
                    />
                    <Input
                        label="Thời Gian Kết Thúc"
                        type="time"
                        {...register('endTime')}
                        error={errors.endTime?.message}
                        icon={<Clock className="w-5 h-5" />}
                        required
                    />
                </div>

                {/* Destination */}
                <Input
                    label="Địa Điểm"
                    placeholder="VD: Hà Nội"
                    {...register('destination')}
                    error={errors.destination?.message}
                    icon={<MapPin className="w-5 h-5" />}
                />

                {/* Day Number (Display only) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                        Hoạt động này sẽ được thêm vào <strong>Ngày {dayNumber}</strong>
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        icon={<X className="w-4 h-4" />}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        icon={<Save className="w-4 h-4" />}
                    >
                        {activity ? 'Cập Nhật' : 'Thêm Hoạt Động'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ActivityForm;
