import React from 'react';
import { Outlet } from 'react-router-dom';
import ProviderHeader from '../../components/layout/Header/ProviderHeader';

const ProviderLayout = () => {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f7" }}>
            <ProviderHeader />
            <main
                style={{
                paddingTop: "70px",
                margin: "0 auto",
                }}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default ProviderLayout;