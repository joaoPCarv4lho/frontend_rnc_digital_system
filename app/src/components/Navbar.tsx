import { useAuth } from "../context/useAuth";

import React from 'react';

interface NavbarProps extends React.InputHTMLAttributes<HTMLInputElement> {
    title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) =>{
    const { user, logout } = useAuth();

    return(
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <div className="text-lg font-semibold">
                RNC Digital System - {title}
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm">Olá, {user?.name}</span>
                <button onClick={logout} className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded">
                    Sair
                </button>
            </div>
        </nav>
    )
}