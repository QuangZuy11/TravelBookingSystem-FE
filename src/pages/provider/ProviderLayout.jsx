import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/layout/Header/Header';

const ProviderLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default ProviderLayout;