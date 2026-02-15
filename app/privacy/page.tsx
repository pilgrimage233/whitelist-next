'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Navbar} from '@/components/Navbar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {AlertCircle, CheckCircle2, Loader2, Shield} from 'lucide-react';
import {getWhitelistUserPrivacy, updateWhitelistUserPrivacy} from '@/lib/api';

const TOKEN_KEY = 'whitelistUserToken';

type AlertState = {
    message: string;
    type: 'success' | 'error' | '';
};

type PrivacyState = {
    showQq: boolean;
    showCity: boolean;
    showLastOnline: boolean;
    showGameTime: boolean;
    showNameHistory: boolean;
    showQuizResult: boolean;
    showUuid: boolean;
};

const defaultPrivacy: PrivacyState = {
    showQq: true,
    showCity: true,
    showLastOnline: true,
    showGameTime: true,
    showNameHistory: true,
    showQuizResult: true,
    showUuid: true
};

export default function PrivacyPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState<AlertState>({message: '', type: ''});
    const [privacy, setPrivacy] = useState<PrivacyState>(defaultPrivacy);

    const showAlert = (message: string, type: 'success' | 'error') => {
        setAlert({message, type});
    };

    useEffect(() => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
        if (!stored) {
            setLoading(false);
            return;
        }

        setToken(stored);
        const fetchPrivacy = async () => {
            setLoading(true);
            try {
                const res = await getWhitelistUserPrivacy(stored);
                const data = res.data || {};
                setPrivacy({
                    showQq: data.showQq !== 0,
                    showCity: data.showCity !== 0,
                    showLastOnline: data.showLastOnline !== 0,
                    showGameTime: data.showGameTime !== 0,
                    showNameHistory: data.showNameHistory !== 0,
                    showQuizResult: data.showQuizResult !== 0,
                    showUuid: data.showUuid !== 0
                });
            } catch (error: any) {
                showAlert(error.message || '获取隐私设置失败', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchPrivacy();
    }, []);

    const handleSave = async () => {
        if (!token) {
            showAlert('请先登录', 'error');
            return;
        }
        setSaving(true);
        try {
            await updateWhitelistUserPrivacy(token, {
                showQq: privacy.showQq ? 1 : 0,
                showCity: privacy.showCity ? 1 : 0,
                showLastOnline: privacy.showLastOnline ? 1 : 0,
                showGameTime: privacy.showGameTime ? 1 : 0,
                showNameHistory: privacy.showNameHistory ? 1 : 0,
                showQuizResult: privacy.showQuizResult ? 1 : 0,
                showUuid: privacy.showUuid ? 1 : 0
            });
            showAlert('隐私设置已更新', 'success');
        } catch (error: any) {
            showAlert(error.message || '更新失败', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen relative bg-background">
                <Navbar/>
                <div className="container mx-auto px-4 pt-24 pb-12">
                    <Card
                        className="mx-auto max-w-xl border-none shadow-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                        <CardContent className="flex items-center gap-2 py-8">
                            <Loader2 className="h-5 w-5 animate-spin"/>
                            <span className="text-sm text-muted-foreground">加载隐私设置...</span>
                        </CardContent>
                    </Card>
                </div>
            </main>
        );
    }

    if (!token) {
        return (
            <main className="min-h-screen relative bg-background">
                <Navbar/>
                <div className="container mx-auto px-4 pt-24 pb-12">
                    <Card
                        className="mx-auto max-w-xl border-none shadow-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle>请先登录</CardTitle>
                            <CardDescription>登录后可设置隐私信息</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => router.push('/login')}>前往登录</Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        );
    }

    const rows = [
        {key: 'showQq', label: '显示QQ号'},
        {key: 'showCity', label: '显示城市'},
        {key: 'showLastOnline', label: '显示最后上线时间'},
        {key: 'showGameTime', label: '显示游戏时间'},
        {key: 'showNameHistory', label: '显示历史名称'},
        {key: 'showQuizResult', label: '显示答题信息'},
        {key: 'showUuid', label: '显示UUID'}
    ] as const;

    return (
        <main className="min-h-screen relative bg-background">
            <Navbar/>
            <div className="container mx-auto px-4 pt-24 pb-12">
                <div
                    className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 animate-in-up delay-100">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:to-blue-400">
                            隐私设置
                        </h1>
                        <p className="text-muted-foreground mt-2">控制成员查询接口中敏感信息的可见性。</p>
                    </div>
                </div>

                <Card
                    className="mx-auto max-w-4xl border-none shadow-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-indigo-500"/>
                            隐私选项
                        </CardTitle>
                        <CardDescription>开启后在成员查询中可见，关闭则隐藏。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {alert.message && (
                            <div
                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                                    alert.type === 'success'
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'border-red-200 bg-red-50 text-red-700'
                                }`}
                            >
                                {alert.type === 'success' ? <CheckCircle2 className="h-4 w-4"/> :
                                    <AlertCircle className="h-4 w-4"/>}
                                {alert.message}
                            </div>
                        )}
                        <div
                            className="rounded-xl border border-border/40 bg-white/70 dark:bg-zinc-900/70 p-5 space-y-4">
                            {rows.map((row) => (
                                <div key={row.key} className="flex items-center justify-between">
                                    <Label htmlFor={row.key} className="text-sm text-foreground">
                                        {row.label}
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={row.key}
                                            checked={privacy[row.key]}
                                            onCheckedChange={(value) =>
                                                setPrivacy((prev) => ({
                                                    ...prev,
                                                    [row.key]: Boolean(value)
                                                }))
                                            }
                                        />
                                        <Badge
                                            className={privacy[row.key] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}>
                                            {privacy[row.key] ? '可见' : '隐藏'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => router.push('/profile')}>
                                返回资料
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : '保存设置'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
