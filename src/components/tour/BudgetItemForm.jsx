import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '@components/shared/Modal';
import FormInput from '@components/common/FormInput';
import FormSelect from '@components/common/FormSelect';
import Button from '@components/common/Button';
import { DollarSign, Save, X } from 'lucide-react';

// Validation schema
const budgetItemSchema = yup.object().shape({
    itemName: yup.string().required('Tên khoản chi là bắt buộc'),
    category: yup.string().required('Danh mục là bắt buộc'),
    amount: yup.number()
        .required('Số tiền là bắt buộc')
        .min(0, 'Số tiền phải lớn hơn 0'),
    description: yup.string(),
});

/**
 * Budget Item Form Component
 * Form for creating/editing budget items
 * 
 * @param {Object} props
 * @param {Object} props.item - Budget item data for editing
 * @param {Function} props.onSave - Save handler
 * @param {Function} props.onCancel - Cancel handler
 */
const BudgetItemForm = ({ item, onSave, onCancel }) => {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(budgetItemSchema),
        defaultValues: item || {
            itemName: '',
            category: 'transportation',
            amount: 0,
            description: '',
        },
    });

    useEffect(() => {
        if (item) {
            reset(item);
        }
    }, [item, reset]);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await onSave(data);
        } catch (error) {
            console.error('Error saving budget item:', error);
        } finally {
            setLoading(false);
        }
    };

    const categoryOptions = [
        { value: 'transportation', label: '🚗 Di chuyển' },
        { value: 'accommodation', label: '🏨 Chỗ ở' },
        { value: 'food', label: '🍽️ Ăn uống' },
        { value: 'activities', label: '🎯 Hoạt động' },
        { value: 'guide', label: '👨‍🏫 Hướng dẫn' },
        { value: 'insurance', label: '🛡️ Bảo hiểm' },
        { value: 'other', label: '📋 Khác' },
    ];

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title={item ? 'Sửa Khoản Chi' : 'Thêm Khoản Chi Mới'}
            size="md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Item Name */}
                <FormInput
                    label="Tên Khoản Chi"
                    placeholder="VD: Vé xe khách Hà Nội - Sapa"
                    {...register('itemName')}
                    error={errors.itemName?.message}
                    required
                />

                {/* Category */}
                <FormSelect
                    label="Danh Mục"
                    {...register('category')}
                    options={categoryOptions}
                    error={errors.category?.message}
                    required
                />

                {/* Amount */}
                <FormInput
                    label="Số Tiền (VNĐ)"
                    type="number"
                    min="0"
                    placeholder="500000"
                    {...register('amount')}
                    error={errors.amount?.message}
                    icon={<DollarSign className="w-5 h-5" />}
                    required
                />

                {/* Description */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Mô Tả (Tùy chọn)
                    </label>
                    <textarea
                        {...register('description')}
                        rows={3}
                        className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Thêm ghi chú về khoản chi..."
                    />
                    {errors.description && (
                        <p className="mt-1.5 text-sm text-danger-600">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                {/* Helper Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Lưu ý:</strong> Số tiền này là chi phí dự kiến cho mỗi người tham gia tour.
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
                        {item ? 'Cập Nhật' : 'Thêm Khoản Chi'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default BudgetItemForm;
