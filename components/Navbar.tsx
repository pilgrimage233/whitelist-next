'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {ThemeSwitcher} from '@/components/ThemeSwitcher';
import {Button} from '@/components/ui/button';
import {getWhitelistUserProfile} from '@/lib/api/whitelistUser';
import {LayoutDashboard, LogOut, Server, User} from 'lucide-react';
import {cn} from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
    rightButtons?: React.ReactNode;
}

export function Navbar({rightButtons}: NavbarProps) {
    const router = useRouter();
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Whitelist.Next';
    const [userName, setUserName] = useState<string | null>(null);
    const [gameId, setGameId] = useState<string | null>(null);
    const [qqNum, setQqNum] = useState<string | null>(null);
    const [hasToken, setHasToken] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const [avatarMode, setAvatarMode] = useState<'mc' | 'qq' | 'initial'>('mc');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('whitelistUserToken');
        const cachedName = localStorage.getItem('whitelistUserName');
        const cachedGameId = localStorage.getItem('whitelistUserGameId');
        const cachedQqNum = localStorage.getItem('whitelistUserQqNum');
        const expireAt = Number(localStorage.getItem('whitelistUserExpireAt'));
        if (!token) {
            setHasToken(false);
            setUserName(null);
            setGameId(null);
            setQqNum(null);
            return;
        }
        if (expireAt && Date.now() > expireAt) {
            localStorage.removeItem('whitelistUserToken');
            localStorage.removeItem('whitelistUserName');
            localStorage.removeItem('whitelistUserGameId');
            localStorage.removeItem('whitelistUserExpireAt');
            setHasToken(false);
            setUserName(null);
            setGameId(null);
            return;
        }
        setHasToken(true);
        if (cachedName) {
            setUserName(cachedName);
        }
        if (cachedGameId) {
            setGameId(cachedGameId);
        }
        if (cachedQqNum) {
            setQqNum(cachedQqNum);
        }
        if (cachedGameId || cachedName) {
            setAvatarMode('mc');
        } else if (cachedQqNum) {
            setAvatarMode('qq');
        } else {
            setAvatarMode('initial');
        }
        setAvatarError(false);

        getWhitelistUserProfile(token)
            .then((res) => {
                const profile = res.data;
                const nextName = profile?.userName || null;
                const nextGameId = profile?.gameId || null;
                const nextQqNum = profile?.qqNum || null;
                if (nextName) {
                    localStorage.setItem('whitelistUserName', nextName);
                }
                if (nextGameId) {
                    localStorage.setItem('whitelistUserGameId', nextGameId);
                }
                if (nextQqNum) {
                    localStorage.setItem('whitelistUserQqNum', nextQqNum);
                }
                if (profile?.roleTitle) {
                    localStorage.setItem('whitelistUserRoleTitle', profile.roleTitle);
                }
                if (profile?.roleLevel !== undefined && profile?.roleLevel !== null) {
                    localStorage.setItem('whitelistUserRoleLevel', String(profile.roleLevel));
                }
                if (profile?.canInitiateVote !== undefined && profile?.canInitiateVote !== null) {
                    localStorage.setItem('whitelistUserCanInitiateVote', String(profile.canInitiateVote));
                }
                if (profile?.expireTime) {
                    localStorage.setItem('whitelistUserExpireAt', String(profile.expireTime));
                }
                setUserName(nextName || cachedName || null);
                setGameId(nextGameId || cachedGameId || null);
                setQqNum(nextQqNum || cachedQqNum || null);
                if (nextGameId || nextName) {
                    setAvatarMode('mc');
                } else if (nextQqNum) {
                    setAvatarMode('qq');
                }
            })
            .catch(() => {
                // Keep cached session on transient errors; server will reject on real expiry.
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('whitelistUserToken');
        localStorage.removeItem('whitelistUserName');
        localStorage.removeItem('whitelistUserGameId');
        localStorage.removeItem('whitelistUserQqNum');
        localStorage.removeItem('whitelistUserRoleTitle');
        localStorage.removeItem('whitelistUserRoleLevel');
        localStorage.removeItem('whitelistUserCanInitiateVote');
        localStorage.removeItem('whitelistUserExpireAt');
        setUserName(null);
        setGameId(null);
        setQqNum(null);
        setHasToken(false);
        router.push('/login');
    };

    const avatarName = gameId || userName || '';
    const displayName = userName || '加载中';
    const qqAvatar = qqNum ? `https://q1.qlogo.cn/g?b=qq&nk=${qqNum}&s=100` : '';
    const avatarSrc = avatarMode === 'mc'
        ? (avatarName ? `https://minotar.net/avatar/${avatarName}/64` : '')
        : avatarMode === 'qq'
            ? qqAvatar
            : '';

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
                scrolled
                    ? 'bg-background/80 backdrop-blur-xl border-border/40 shadow-sm py-3'
                    : 'bg-transparent border-transparent py-5'
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => router.push('/')}
                >
                    <div
                        className={cn(
                            'p-2.5 rounded-xl transition-all duration-300 relative overflow-hidden',
                            scrolled ? 'bg-primary/10' : 'bg-card/30 backdrop-blur-md border border-white/10'
                        )}
                    >
                        <div
                            className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"/>
                        <Server
                            className="h-5 w-5 text-primary relative z-10 transition-transform group-hover:scale-110 group-hover:rotate-12"/>
                    </div>
                    <span className="font-heading font-bold text-xl tracking-tight">
                        {appName}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    {hasToken ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="gap-2 font-medium hover:bg-primary/10 hover:text-primary rounded-full px-4 h-11 border border-transparent hover:border-primary/20 transition-all"
                                >
                                    <div
                                        className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-background bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                        {avatarSrc && !avatarError ? (
                                            <img
                                                src={avatarSrc}
                                                alt={avatarName}
                                                className="w-full h-full object-cover"
                                                onError={() => {
                                                    if (avatarMode === 'mc' && qqAvatar) {
                                                        setAvatarMode('qq');
                                                        setAvatarError(false);
                                                        return;
                                                    }
                                                    setAvatarError(true);
                                                    setAvatarMode('initial');
                                                }}
                                            />
                                        ) : (
                                            <span>{displayName.substring(0, 1).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <span className="hidden sm:inline-block">{displayName}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 glass-card border-border/50">
                                <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4"/>
                                    <span>个人中心</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/change-id')} className="cursor-pointer">
                                    <LayoutDashboard className="mr-2 h-4 w-4"/>
                                    <span>修改 ID</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/vote')} className="cursor-pointer">
                                    <LayoutDashboard className="mr-2 h-4 w-4"/>
                                    <span>玩家投票</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem onClick={handleLogout}
                                                  className="text-destructive cursor-pointer hover:bg-destructive/10">
                                    <LogOut className="mr-2 h-4 w-4"/>
                                    <span>退出登录</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button
                            size="sm"
                            className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-heading font-bold"
                            onClick={() => router.push('/login')}
                        >
                            登录
                        </Button>
                    )}
                    <div className="pl-4 border-l border-border/50">
                        <ThemeSwitcher/>
                    </div>
                    {rightButtons}
                </div>
            </div>
        </nav>
    );
}
