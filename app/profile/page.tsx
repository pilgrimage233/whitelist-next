'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Navbar} from '@/components/Navbar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Clock, Edit, History, Loader2, LogOut, Shield, UserRound} from 'lucide-react';
import {changeWhitelistUserPassword, checkMemberDetail, getWhitelistUserProfile} from '@/lib/api';
import {cn} from '@/lib/utils';

const TOKEN_KEY = 'whitelistUserToken';
const DEMO_LOGIN_ENABLED = ['1', 'true', 'yes', 'on'].includes(
    (process.env.NEXT_PUBLIC_WHITELIST_DEMO_ENABLED || '').toLowerCase()
);
const DEMO_LOGIN_USER_NAME = (process.env.NEXT_PUBLIC_WHITELIST_DEMO_USERNAME || '').trim();

type AlertState = {
    message: string;
    type: 'success' | 'error' | '';
};

export default function ProfilePage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [memberDetail, setMemberDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState<AlertState>({message: '', type: ''});
    const [pwdForm, setPwdForm] = useState({oldPassword: '', newPassword: '', confirmPassword: ''});
    const [pwdLoading, setPwdLoading] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const [avatarMode, setAvatarMode] = useState<'mc' | 'qq' | 'initial'>('mc');
    const isDemoAccount = DEMO_LOGIN_ENABLED
        && Boolean(DEMO_LOGIN_USER_NAME)
        && String(profile?.userName || '').toLowerCase() === DEMO_LOGIN_USER_NAME.toLowerCase();

    const showAlert = (message: string, type: 'success' | 'error') => {
        setAlert({message, type});
    };

    const resetAlert = () => setAlert({message: '', type: ''});

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
        }
        setToken(null);
        router.push('/login');
    };

    useEffect(() => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
        if (!stored) {
            setLoading(false);
            return;
        }

        setToken(stored);
        const fetchData = async () => {
            setLoading(true);
            try {
                const profileRes = await getWhitelistUserProfile(stored);
                const profileData = profileRes.data;
                setProfile(profileData);
                if (profileData?.userName) {
                    localStorage.setItem('whitelistUserName', profileData.userName);
                }
                if (profileData?.gameId) {
                    localStorage.setItem('whitelistUserGameId', profileData.gameId);
                }
                if (profileData?.qqNum) {
                    localStorage.setItem('whitelistUserQqNum', profileData.qqNum);
                }
                if (profileData?.roleTitle) {
                    localStorage.setItem('whitelistUserRoleTitle', profileData.roleTitle);
                }
                if (profileData?.roleLevel !== undefined && profileData?.roleLevel !== null) {
                    localStorage.setItem('whitelistUserRoleLevel', String(profileData.roleLevel));
                }
                if (profileData?.canInitiateVote !== undefined && profileData?.canInitiateVote !== null) {
                    localStorage.setItem('whitelistUserCanInitiateVote', String(profileData.canInitiateVote));
                }
                if (profileData?.expireTime) {
                    localStorage.setItem('whitelistUserExpireAt', String(profileData.expireTime));
                }

                if (profileData?.checkInfo && Object.keys(profileData.checkInfo).length > 0) {
                    setMemberDetail(profileData.checkInfo);
                    return;
                }

                if (profileData?.userName) {
                    const detailRes = await checkMemberDetail(profileData.userName);
                    setMemberDetail(detailRes.data);
                }
            } catch (error: any) {
                showAlert(error.message || '获取资料失败', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (profile?.gameId || profile?.userName) {
            setAvatarError(false);
            setAvatarMode('mc');
        }
    }, [profile?.gameId, profile?.userName]);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        resetAlert();
        if (isDemoAccount) {
            showAlert('演示账户不允许修改密码', 'error');
            return;
        }
        if (!token) {
            showAlert('请先登录', 'error');
            return;
        }
        if (!pwdForm.oldPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
            showAlert('请填写完整密码信息', 'error');
            return;
        }
        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            showAlert('两次输入的新密码不一致', 'error');
            return;
        }
        setPwdLoading(true);
        try {
            const res = await changeWhitelistUserPassword(token, pwdForm.oldPassword, pwdForm.newPassword);
            showAlert(res.msg || '密码修改成功', 'success');
            setPwdForm({oldPassword: '', newPassword: '', confirmPassword: ''});
        } catch (error: any) {
            showAlert(error.message || '密码修改失败', 'error');
        } finally {
            setPwdLoading(false);
        }
    };

    if (!token && !loading) {
        return (
            <main className="min-h-screen relative bg-background">
                <Navbar/>
                <div className="container mx-auto px-4 pt-24 pb-12 flex flex-col items-center">
                    <Card
                        className="max-w-md w-full border-none shadow-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                        <CardHeader className="text-center">
                            <UserRound className="w-12 h-12 mx-auto text-slate-400 mb-4"/>
                            <CardTitle>需要登录</CardTitle>
                            <CardDescription>请先登录以访问您的个人资料。</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Button onClick={() => router.push('/login')} className="px-8">前往登录</Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        );
    }

    const avatarName = profile?.gameId || profile?.userName || '';
    const qqAvatar = profile?.qqNum ? `https://q1.qlogo.cn/g?b=qq&nk=${profile.qqNum}&s=100` : '';
    const avatarSrc = avatarMode === 'mc'
        ? (avatarName ? `https://minotar.net/avatar/${avatarName}/120` : '')
        : avatarMode === 'qq'
            ? qqAvatar
            : '';

    return (
        <main className="min-h-screen relative pb-16 bg-background">
            <Navbar/>

            <div className="container mx-auto px-4 pt-24 pb-12">
                <div
                    className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 animate-in-up delay-100">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:to-blue-400">
                            个人资料
                        </h1>
                        <p className="text-muted-foreground mt-2">管理账号信息、登录记录与安全设置。</p>
                    </div>
                    {loading && <Loader2 className="h-6 w-6 animate-spin text-primary"/>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <Card
                        className="lg:col-span-8 border-none shadow-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md animate-in-up delay-200 h-fit">
                        <CardHeader className="pb-8 border-b border-border/20">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div
                                    className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 p-0.5 shadow-2xl">
                                    <div
                                        className="w-full h-full rounded-full overflow-hidden bg-white/90 dark:bg-zinc-900/90 flex items-center justify-center backdrop-blur-sm">
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
                                            <span className="text-4xl font-bold text-slate-800 dark:text-white">
                        {profile?.userName?.substring(0, 1).toUpperCase() || 'U'}
                      </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-center sm:text-left space-y-1">
                                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                                        <h2 className="text-2xl font-bold">{profile?.userName || 'Loading...'}</h2>
                                        <Badge
                                            className="bg-primary/20 text-primary border-primary/20">{profile?.roleTitle || '成员'}</Badge>
                                        {profile?.canInitiateVote === 1 && (
                                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600">
                                                可发起投票
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground font-mono text-sm">白名单ID: {profile?.whitelistId || '---'}</p>
                                    <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                                        <Button variant="outline" size="sm" className="h-7 text-xs border-dashed gap-1"
                                                onClick={() => router.push('/change-id')}>
                                            <Edit className="w-3 h-3"/> 修改ID
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-7 text-xs border-dashed gap-1"
                                                onClick={() => router.push('/privacy')}>
                                            <Shield className="w-3 h-3"/> 隐私设置
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="sm"
                                                        className="h-7 text-xs gap-1 hover:bg-white/50 dark:hover:bg-zinc-800/60">
                                                    <History className="w-3 h-3"/> 记录
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="max-w-2xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>在线记录</AlertDialogTitle>
                                                </AlertDialogHeader>
                                                <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2">
                                                    {profile?.onlineRecords?.map((record: any, i: number) => (
                                                        <div key={i}
                                                             className="flex items-center justify-between p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-border/40 text-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                                                                    <Clock className="w-4 h-4 text-emerald-600"/>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium">会话
                                                                        #{record.id || i + 1}</div>
                                                                    <div
                                                                        className="text-xs text-muted-foreground">{record.loginTime ? new Date(record.loginTime).toLocaleDateString() : '-'}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-mono">{record.playMinutes}m</div>
                                                                <div className="text-xs text-muted-foreground">时长
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!profile?.onlineRecords || profile.onlineRecords.length === 0) && (
                                                        <div
                                                            className="text-center py-8 text-muted-foreground">暂无在线记录。</div>
                                                    )}
                                                </div>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Close</AlertDialogCancel>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">账号信息</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-border/40 space-y-1">
                                    <Label className="text-xs text-muted-foreground">绑定QQ</Label>
                                    <div className="font-mono text-lg">{profile?.qqNum || '未绑定'}</div>
                                </div>
                                <div
                                    className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-border/40 space-y-1">
                                    <Label className="text-xs text-muted-foreground">游戏ID</Label>
                                    <div
                                        className="font-mono text-lg">{profile?.gameId || profile?.userName || '未绑定'}</div>
                                </div>
                                <div
                                    className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-border/40 space-y-1">
                                    <Label className="text-xs text-muted-foreground">账号状态</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                                        <span>已启用</span>
                                    </div>
                                </div>
                                <div
                                    className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-border/40 space-y-1">
                                    <Label className="text-xs text-muted-foreground">等级 / 头衔</Label>
                                    <div className="font-mono text-lg">
                                        Lv.{profile?.roleLevel || 1} · {profile?.roleTitle || '成员'}
                                    </div>
                                </div>
                                <div
                                    className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-border/40 space-y-1">
                                    <Label className="text-xs text-muted-foreground">最近登录</Label>
                                    <div
                                        className="text-sm">{profile?.loginTime ? new Date(profile.loginTime).toLocaleString() : '从未登录'}</div>
                                </div>
                                <div
                                    className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-border/40 space-y-1">
                                    <Label className="text-xs text-muted-foreground">到期时间</Label>
                                    <div
                                        className="text-sm">{profile?.expireTime ? new Date(profile.expireTime).toLocaleString() : '永久'}</div>
                                </div>
                            </div>

                            {memberDetail && (
                                <div className="mt-8">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">原始数据</h3>
                                    <div
                                        className="p-4 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-border/40 font-mono text-xs overflow-x-auto text-muted-foreground">
                                        <pre>{JSON.stringify(memberDetail, null, 2)}</pre>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-4 space-y-6 animate-in-up delay-300">
                        <Card className="border-none shadow-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                            <CardHeader className="pb-3 border-b border-border/20">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-rose-500"/>
                                    安全设置
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {alert.message && (
                                    <div className={cn(
                                        'mb-4 text-xs p-2 rounded border',
                                        alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
                                    )}>
                                        {alert.message}
                                    </div>
                                )}
                                <form onSubmit={handleChangePassword} className="space-y-3">
                                    {isDemoAccount && (
                                        <div
                                            className="text-xs p-2 rounded border bg-amber-50 border-amber-200 text-amber-700">
                                            当前为演示账户，已禁用密码修改。
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <Label className="text-xs ml-1 text-muted-foreground">当前密码</Label>
                                        <Input
                                            type="password"
                                            className="h-10 text-sm bg-white/50 dark:bg-zinc-800/50"
                                            value={pwdForm.oldPassword}
                                            disabled={isDemoAccount}
                                            onChange={(e) => setPwdForm({...pwdForm, oldPassword: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs ml-1 text-muted-foreground">新密码</Label>
                                        <Input
                                            type="password"
                                            className="h-10 text-sm bg-white/50 dark:bg-zinc-800/50"
                                            value={pwdForm.newPassword}
                                            disabled={isDemoAccount}
                                            onChange={(e) => setPwdForm({...pwdForm, newPassword: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs ml-1 text-muted-foreground">确认新密码</Label>
                                        <Input
                                            type="password"
                                            className="h-10 text-sm bg-white/50 dark:bg-zinc-800/50"
                                            value={pwdForm.confirmPassword}
                                            disabled={isDemoAccount}
                                            onChange={(e) => setPwdForm({...pwdForm, confirmPassword: e.target.value})}
                                        />
                                    </div>
                                    <Button type="submit" disabled={pwdLoading || isDemoAccount}
                                            className="w-full mt-2 h-10 text-sm">
                                        {pwdLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2"/> : '修改密码'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Button variant="destructive" className="w-full" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2"/> 退出登录
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
