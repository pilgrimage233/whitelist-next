'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail, Shield, UserRound} from 'lucide-react';
import {getWhitelistUserProfile, loginWhitelistUser, registerWhitelistUser, sendWhitelistUserCode,} from '@/lib/api';
import {Navbar} from '@/components/Navbar';
import {cn} from '@/lib/utils';

const TOKEN_KEY = 'whitelistUserToken';
const DEMO_LOGIN_ENABLED = ['1', 'true', 'yes', 'on'].includes(
    (process.env.NEXT_PUBLIC_WHITELIST_DEMO_ENABLED || '').toLowerCase()
);
const DEMO_LOGIN_USER_NAME = (process.env.NEXT_PUBLIC_WHITELIST_DEMO_USERNAME || '').trim();
const DEMO_LOGIN_PASSWORD = process.env.NEXT_PUBLIC_WHITELIST_DEMO_PASSWORD || '';
const HAS_DEMO_LOGIN_CONFIG = DEMO_LOGIN_ENABLED && Boolean(DEMO_LOGIN_USER_NAME) && Boolean(DEMO_LOGIN_PASSWORD);

type Step = 'sendCode' | 'register' | 'login';

type AlertState = {
    message: string;
    type: 'success' | 'error' | '';
};

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(HAS_DEMO_LOGIN_CONFIG ? 'login' : 'sendCode');
    const [alert, setAlert] = useState<AlertState>({message: '', type: ''});
    const [loading, setLoading] = useState(false);

    const [sendForm, setSendForm] = useState({qqNum: ''});
    const [registerForm, setRegisterForm] = useState({
        qqNum: '',
        code: '',
        userName: '',
        password: '',
        confirmPassword: ''
    });
    const [loginForm, setLoginForm] = useState({
        userName: HAS_DEMO_LOGIN_CONFIG ? DEMO_LOGIN_USER_NAME : '',
        password: HAS_DEMO_LOGIN_CONFIG ? DEMO_LOGIN_PASSWORD : ''
    });

    const showAlert = (message: string, type: 'success' | 'error') => {
        setAlert({message, type});
    };

    const resetAlert = () => setAlert({message: '', type: ''});

    useEffect(() => {
        if (HAS_DEMO_LOGIN_CONFIG) {
            setStep('login');
            setLoginForm({userName: DEMO_LOGIN_USER_NAME, password: DEMO_LOGIN_PASSWORD});
            return;
        }
        const hasAccount = typeof window !== 'undefined' ? localStorage.getItem('whitelistUserHasAccount') : null;
        if (hasAccount) {
            setStep('login');
        }
    }, []);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        resetAlert();
        if (!/^[0-9]{5,11}$/.test(sendForm.qqNum)) {
            showAlert('请输入正确的QQ号', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await sendWhitelistUserCode(sendForm.qqNum);
            showAlert(res.msg || '验证码已发送', 'success');
            setRegisterForm(prev => ({...prev, qqNum: sendForm.qqNum}));
            setStep('register');
        } catch (error: any) {
            showAlert(error.message || '验证码发送失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        resetAlert();
        if (!registerForm.qqNum || !registerForm.code || !registerForm.userName || !registerForm.password) {
            showAlert('请填写完整信息', 'error');
            return;
        }
        if (registerForm.password !== registerForm.confirmPassword) {
            showAlert('两次密码输入不一致', 'error');
            localStorage.setItem('whitelistUserHasAccount', 'true');
            return;
        }
        setLoading(true);
        try {
            const res = await registerWhitelistUser({
                qqNum: registerForm.qqNum,
                code: registerForm.code,
                userName: registerForm.userName,
                password: registerForm.password
            });
            showAlert(res.msg || '账号设置成功', 'success');
            setStep('login');
        } catch (error: any) {
            showAlert(error.message || '账号设置失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        resetAlert();
        if (!loginForm.userName || !loginForm.password) {
            showAlert('请输入账号与密码', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await loginWhitelistUser(loginForm);
            const nextToken = res.data?.token || (res as any).token;
            if (!nextToken) {
                throw new Error('登录失败');
            }
            localStorage.setItem(TOKEN_KEY, nextToken);
            localStorage.setItem('whitelistUserHasAccount', 'true');
            localStorage.setItem('whitelistUserName', loginForm.userName);
            if ((res as any).expireTime) {
                const expireMinutes = Number((res as any).expireTime);
                if (!Number.isNaN(expireMinutes)) {
                    localStorage.setItem('whitelistUserExpireAt', String(Date.now() + expireMinutes * 60 * 1000));
                }
            }
            try {
                const profileRes = await getWhitelistUserProfile(nextToken);
                const profileData = profileRes.data;
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
            } catch {
                // Ignore profile caching failures and continue to profile page.
            }
            showAlert('登录成功', 'success');
            router.push('/profile');
        } catch (error: any) {
            showAlert(error.message || '登录失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen relative overflow-hidden bg-background">
            <Navbar/>

            <div className="container mx-auto px-4 pt-24 pb-12">
                <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <section className="space-y-8 animate-in-up delay-100 hidden lg:block">
                        <div className="space-y-4">
                            <Badge variant="outline"
                                   className="border-primary/30 text-primary bg-primary/10 px-3 py-1 text-sm">
                                账号登录
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:to-blue-400">
                                登录并管理你的
                                <br/>
                                游戏资料
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                                通过 QQ 验证码快速绑定账号，安全访问白名单与个人资料设置。
                            </p>
                        </div>

                        <div className="space-y-4 pt-4">
                            {[
                                {
                                    icon: Mail,
                                    title: '验证身份',
                                    desc: 'QQ 邮箱验证码',
                                    active: step === 'sendCode',
                                    done: step !== 'sendCode'
                                },
                                {
                                    icon: Shield,
                                    title: '设置账号',
                                    desc: '设置账号与密码',
                                    active: step === 'register',
                                    done: step === 'login'
                                },
                                {
                                    icon: UserRound,
                                    title: '登录管理',
                                    desc: '进入个人资料',
                                    active: step === 'login',
                                    done: false
                                }
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        'flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border',
                                        item.active ? 'bg-primary/10 border-primary/40 text-primary translate-x-3' : 'bg-white/40 dark:bg-zinc-900/40 border-transparent text-slate-500',
                                        item.done ? 'text-emerald-600' : ''
                                    )}
                                >
                                    <div className={cn(
                                        'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                                        item.active ? 'bg-primary text-white' : 'bg-white/70 dark:bg-zinc-800/70 text-slate-500'
                                    )}>
                                        <item.icon className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                        <p className="text-sm opacity-80">{item.desc}</p>
                                    </div>
                                    {item.active && <ArrowRight className="ml-auto w-5 h-5 text-primary"/>}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="animate-in-up delay-200">
                        <Card className="border-none shadow-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                            <CardHeader className="space-y-1 pb-6 text-center">
                                <CardTitle className="text-2xl font-bold">
                                    {step === 'sendCode' ? '开始验证' : step === 'register' ? '创建账号' : '欢迎回来'}
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {step === 'sendCode' ? '请输入 QQ 号获取验证码' : step === 'register' ? '完成账号与密码设置' : '登录以继续访问'}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6 px-8 pb-8">
                                {alert.message && (
                                    <div className={cn(
                                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                                        alert.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'
                                    )}>
                                        {alert.type === 'success' ? <CheckCircle2 className="h-4 w-4"/> :
                                            <AlertCircle className="h-4 w-4"/>}
                                        {alert.message}
                                    </div>
                                )}

                                <div className="flex bg-white/70 dark:bg-zinc-800/70 p-1 rounded-lg lg:hidden">
                                    {(['sendCode', 'register', 'login'] as Step[]).map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setStep(s)}
                                            className={cn(
                                                'flex-1 text-xs font-medium py-2 rounded-md transition-all',
                                                step === s ? 'bg-primary/20 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                            )}
                                        >
                                            {s === 'sendCode' ? '验证' : s === 'register' ? '注册' : '登录'}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    {step === 'sendCode' && (
                                        <form onSubmit={handleSendCode} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="qqNum" className="text-sm font-semibold">QQ 号</Label>
                                                <Input
                                                    id="qqNum"
                                                    placeholder="请输入 QQ 号"
                                                    className="h-11 bg-white/50 dark:bg-zinc-800/50"
                                                    value={sendForm.qqNum}
                                                    onChange={(e) => setSendForm({qqNum: e.target.value})}
                                                />
                                            </div>
                                            <Button type="submit" disabled={loading}
                                                    className="w-full h-11 font-semibold">
                                                {loading ? <Loader2 className="h-5 w-5 animate-spin"/> : '发送验证码'}
                                            </Button>
                                        </form>
                                    )}

                                    {step === 'register' && (
                                        <form onSubmit={handleRegister} className="space-y-4">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold">QQ 号</Label>
                                                    <Input value={registerForm.qqNum} disabled
                                                           className="h-11 bg-white/50 dark:bg-zinc-800/50 opacity-70"/>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold">验证码</Label>
                                                    <Input
                                                        placeholder="请输入验证码"
                                                        className="h-11 bg-white/50 dark:bg-zinc-800/50"
                                                        value={registerForm.code}
                                                        onChange={(e) => setRegisterForm({
                                                            ...registerForm,
                                                            code: e.target.value
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">账号</Label>
                                                <Input
                                                    placeholder="请输入登录账号"
                                                    className="h-11 bg-white/50 dark:bg-zinc-800/50"
                                                    value={registerForm.userName}
                                                    onChange={(e) => setRegisterForm({
                                                        ...registerForm,
                                                        userName: e.target.value
                                                    })}
                                                />
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold">密码</Label>
                                                    <Input
                                                        type="password"
                                                        className="h-11 bg-white/50 dark:bg-zinc-800/50"
                                                        value={registerForm.password}
                                                        onChange={(e) => setRegisterForm({
                                                            ...registerForm,
                                                            password: e.target.value
                                                        })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold">确认密码</Label>
                                                    <Input
                                                        type="password"
                                                        className="h-11 bg-white/50 dark:bg-zinc-800/50"
                                                        value={registerForm.confirmPassword}
                                                        onChange={(e) => setRegisterForm({
                                                            ...registerForm,
                                                            confirmPassword: e.target.value
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                            <Button type="submit" disabled={loading}
                                                    className="w-full h-11 font-semibold">
                                                {loading ? <Loader2 className="h-5 w-5 animate-spin"/> : '完成设置'}
                                            </Button>
                                        </form>
                                    )}

                                    {step === 'login' && (
                                        <form onSubmit={handleLogin} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="loginUser"
                                                       className="text-sm font-semibold">账号</Label>
                                                <Input
                                                    id="loginUser"
                                                    placeholder="请输入账号"
                                                    className="h-11 bg-white/50 dark:bg-zinc-800/50"
                                                    value={loginForm.userName}
                                                    onChange={(e) => setLoginForm({
                                                        ...loginForm,
                                                        userName: e.target.value
                                                    })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="loginPass"
                                                       className="text-sm font-semibold">密码</Label>
                                                <Input
                                                    id="loginPass"
                                                    type="password"
                                                    placeholder="请输入密码"
                                                    className="h-11 bg-white/50 dark:bg-zinc-800/50"
                                                    value={loginForm.password}
                                                    onChange={(e) => setLoginForm({
                                                        ...loginForm,
                                                        password: e.target.value
                                                    })}
                                                />
                                            </div>
                                            <Button type="submit" disabled={loading}
                                                    className="w-full h-11 font-semibold">
                                                {loading ? <Loader2 className="h-5 w-5 animate-spin"/> : '登录'}
                                            </Button>
                                        </form>
                                    )}
                                </div>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setStep(step === 'login' ? 'sendCode' : 'login')}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                                    >
                                        {step === 'login' ? '没有账号？去注册' : '已有账号？去登录'}
                                    </button>
                                </div>

                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </main>
    );
}
