import React from 'react';

const Table = ({ 
    columns, 
    data, 
    onRowClick, 
    emptyMessage = 'No data available',
    isLoading = false,
    hoverable = true,
    striped = false
}) => {
    // Styles
    const tableContainerStyle = {
        overflowX: 'auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0'
    };

    const theadStyle = {
        background: '#f9fafb',
        borderBottom: '2px solid #e5e7eb'
    };

    const thStyle = {
        textAlign: 'left',
        padding: '1rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap'
    };

    const tbodyStyle = {
        background: 'white'
    };

    const trStyle = (index, clickable) => ({
        borderBottom: '1px solid #f3f4f6',
        transition: 'all 0.2s ease',
        cursor: clickable ? 'pointer' : 'default',
        background: striped && index % 2 === 1 ? '#f9fafb' : 'white'
    });

    const tdStyle = {
        padding: '1rem',
        fontSize: '0.875rem',
        color: '#1f2937'
    };

    const loadingStyle = {
        textAlign: 'center',
        padding: '3rem',
        color: '#6b7280'
    };

    const emptyStyle = {
        textAlign: 'center',
        padding: '3rem',
        color: '#6b7280'
    };

    const spinnerStyle = {
        display: 'inline-block',
        width: '40px',
        height: '40px',
        border: '4px solid #f3f4f6',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    };

    const renderCellContent = (column, row) => {
        if (column.render) {
            return column.render(row[column.key], row);
        }
        return row[column.key];
    };

    return (
        <>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            <div style={tableContainerStyle}>
                <table style={tableStyle}>
                    <thead style={theadStyle}>
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={column.key}
                                    style={{
                                        ...thStyle,
                                        textAlign: column.align || 'left',
                                        width: column.width || 'auto',
                                        ...(index === 0 && { borderTopLeftRadius: '12px' }),
                                        ...(index === columns.length - 1 && { borderTopRightRadius: '12px' })
                                    }}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody style={tbodyStyle}>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} style={loadingStyle}>
                                    <div style={spinnerStyle}></div>
                                    <p style={{ marginTop: '1rem' }}>Loading...</p>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} style={emptyStyle}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                                    <p>{emptyMessage}</p>
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={row.id || rowIndex}
                                    style={trStyle(rowIndex, Boolean(onRowClick))}
                                    onClick={() => onRowClick?.(row)}
                                    onMouseEnter={(e) => {
                                        if (hoverable) {
                                            e.currentTarget.style.background = '#f9fafb';
                                            if (onRowClick) {
                                                e.currentTarget.style.transform = 'scale(1.01)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                            }
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (hoverable) {
                                            e.currentTarget.style.background = 
                                                striped && rowIndex % 2 === 1 ? '#f9fafb' : 'white';
                                            if (onRowClick) {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }
                                        }
                                    }}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            style={{
                                                ...tdStyle,
                                                textAlign: column.align || 'left'
                                            }}
                                        >
                                            {renderCellContent(column, row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Table;