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
            className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => router.push('/')}
                >
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Server className="h-5 w-5 text-primary transition-transform group-hover:scale-110"/>
                    </div>
                    <span
                        className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:to-blue-400">
                        白名单系统
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeSwitcher/>
                    {rightButtons}
                </div>
            </div>
        </nav>
    );
}
