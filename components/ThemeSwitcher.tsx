'use client';

import {useTheme} from 'next-themes';
import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Popover, PopoverContent, PopoverTrigger,} from '@/components/ui/popover';
import {Check, Palette} from 'lucide-react';

const themes = [
    {name: 'light', label: '浅色', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'},
    {name: 'dark', label: '深色', gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)'},
    {name: 'ocean', label: '海洋', gradient: 'linear-gradient(135deg, #667eea 0%, #06b6d4 100%)'},
    {name: 'sunset', label: '日落', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'},
    {name: 'forest', label: '森林', gradient: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)'},
    {name: 'pink', label: '粉色', gradient: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)'},
];

export function ThemeSwitcher() {
    const {theme, setTheme} = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="relative overflow-hidden"
                >
                    <Palette className="h-5 w-5"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-3">
                    <h3 className="font-semibold text-sm mb-3">选择主题</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {themes.map((t) => (
                            <button
                                key={t.name}
                                onClick={() => setTheme(t.name)}
                                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg
                  transition-all duration-200
                  hover:scale-105 hover:shadow-md
                  ${
                                    theme === t.name
                                        ? 'bg-primary/10 ring-2 ring-primary'
                                        : 'bg-secondary/50 hover:bg-secondary'
                                }
                `}
                            >
                                <div
                                    className="w-6 h-6 rounded-lg ring-2 ring-white/50 shadow-sm"
                                    style={{background: t.gradient}}
                                />
                                <span className="text-sm font-medium flex-1 text-left">
                  {t.label}
                </span>
                                {theme === t.name && (
                                    <Check className="h-4 w-4 text-primary"/>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
