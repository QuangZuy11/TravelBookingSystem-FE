import React from 'react';
import { Outlet } from 'react-router-dom';
import Headers from '../../components/layout/Header/Header';
import TopBar from '../../components/layout/Topbar/Topbar';
const ProviderLayout = () => {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f7" }}>
            <TopBar />
            <Headers />
            <main
                style={{
                paddingTop: "100px",
                margin: "0 auto",
                }}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default ProviderLayout;