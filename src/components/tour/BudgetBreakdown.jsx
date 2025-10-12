import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';
import BudgetItemForm from './BudgetItemForm';
import { useItinerary } from '@hooks/useItinerary';
import { formatCurrency } from '@utils/tourHelpers';
import { Plus, Edit, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = {
    transportation: '#3b82f6',
    accommodation: '#10b981',
    food: '#f59e0b',
    activities: '#8b5cf6',
    guide: '#ec4899',
    insurance: '#6366f1',
    other: '#6b7280',
};

const CATEGORY_LABELS = {
    transportation: '🚗 Di chuyển',
    accommodation: '🏨 Chỗ ở',
    food: '🍽️ Ăn uống',
    activities: '🎯 Hoạt động',
    guide: '👨‍🏫 Hướng dẫn',
    insurance: '🛡️ Bảo hiểm',
    other: '📋 Khác',
};

/**
 * Budget Breakdown Component
 * Displays and manages tour budget items with visualization
 * 
 * @param {Object} props
 * @param {number} props.tourId - Tour ID
 */
const BudgetBreakdown = ({ tourId }) => {
    const {
        budgetItems,
        budgetLoading,
        fetchBudgetBreakdown,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
    } = useItinerary(tourId);

    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        if (tourId) {
            fetchBudgetBreakdown(tourId);
        }
    }, [tourId]);

    // Group items by category
    const groupedByCategory = budgetItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    // Calculate totals
    const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);
    const categoryTotals = Object.entries(groupedByCategory).map(([category, items]) => ({
        category,
        amount: items.reduce((sum, item) => sum + item.amount, 0),
    }));

    // Prepare chart data
    const chartData = categoryTotals.map((cat) => ({
        name: CATEGORY_LABELS[cat.category] || cat.category,
        value: cat.amount,
        percentage: ((cat.amount / totalBudget) * 100).toFixed(1),
    }));

    const handleAddItem = async (data) => {
        try {
            await addBudgetItem(tourId, data);
            setShowForm(false);
            toast.success('Thêm khoản chi thành công');
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleUpdateItem = async (data) => {
        try {
            await updateBudgetItem(editingItem.id, data);
            setEditingItem(null);
            setShowForm(false);
            toast.success('Cập nhật khoản chi thành công');
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Bạn có chắc muốn xóa khoản chi này?')) return;

        try {
            await deleteBudgetItem(itemId);
            toast.success('Xóa khoản chi thành công');
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingItem(null);
    };

    if (budgetLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Ngân Sách Tour</h2>
                    <p className="text-gray-600 mt-1">Quản lý chi phí dự kiến cho tour</p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowForm(true)}
                >
                    Thêm Khoản Chi
                </Button>
            </div>

            {budgetItems.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Chưa Có Khoản Chi Nào
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Thêm các khoản chi để quản lý ngân sách tour
                        </p>
                        <Button
                            variant="primary"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={() => setShowForm(true)}
                        >
                            Thêm Khoản Chi Đầu Tiên
                        </Button>
                    </div>
                </Card>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary-100 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Tổng Ngân Sách</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(totalBudget)}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-secondary-100 rounded-lg">
                                    <AlertCircle className="w-6 h-6 text-secondary-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Số Khoản Chi</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {budgetItems.length}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Danh Mục</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {Object.keys(groupedByCategory).length}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <Card>
                            <h3 className="text-lg font-semibold mb-4">Phân Bổ Ngân Sách</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ percentage }) => `${percentage}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[Object.keys(groupedByCategory)[index]] || '#6b7280'}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        contentStyle={{ borderRadius: '8px' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Category Breakdown */}
                        <Card>
                            <h3 className="text-lg font-semibold mb-4">Chi Tiết Theo Danh Mục</h3>
                            <div className="space-y-3">
                                {categoryTotals.map((cat) => (
                                    <div key={cat.category} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: COLORS[cat.category] }}
                                            />
                                            <span className="font-medium">
                                                {CATEGORY_LABELS[cat.category] || cat.category}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{formatCurrency(cat.amount)}</p>
                                            <p className="text-sm text-gray-600">
                                                {((cat.amount / totalBudget) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Budget Items by Category */}
                    <div className="space-y-4">
                        {Object.entries(groupedByCategory).map(([category, items]) => (
                            <Card key={category}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">
                                        {CATEGORY_LABELS[category] || category}
                                    </h3>
                                    <Badge variant="primary">
                                        {items.length} khoản
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{item.itemName}</h4>
                                                {item.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {formatCurrency(item.amount)}
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        icon={<Edit className="w-4 h-4" />}
                                                        onClick={() => handleEdit(item)}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        icon={<Trash2 className="w-4 h-4" />}
                                                        onClick={() => handleDeleteItem(item.id)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Budget Item Form Modal */}
            {showForm && (
                <BudgetItemForm
                    item={editingItem}
                    onSave={editingItem ? handleUpdateItem : handleAddItem}
                    onCancel={handleCloseForm}
                />
            )}
        </div>
    );
};

export default BudgetBreakdown;
