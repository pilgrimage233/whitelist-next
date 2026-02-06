'use client';

import {useRouter} from 'next/navigation';
import {ThemeSwitcher} from '@/components/ThemeSwitcher';
import {Server} from 'lucide-react';

interface NavbarProps {
    rightButtons?: React.ReactNode;
}

export function Navbar({rightButtons}: NavbarProps) {
    const router = useRouter();

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div
                    className="flex items-center gap-2 fade-in cursor-pointer"
                    onClick={() => router.push('/')}
                >
                    <Server className="h-5 w-5 text-blue-500 dark:text-blue-400"/>
                    <span className="font-bold text-lg gradient-text">白名单系统</span>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeSwitcher/>
                    {rightButtons}
                </div>
            </div>
        </nav>
    );
}
