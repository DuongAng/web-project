import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
    const [searchValue, setSearchValue] = useState('');

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar searchValue={searchValue} onSearchChange={setSearchValue} />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 px-6 py-4 overflow-auto">
                    <Outlet context={{ searchValue, setSearchValue }} />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;