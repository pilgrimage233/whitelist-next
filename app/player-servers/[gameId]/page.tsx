'use client';

import {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {AlertCircle, ArrowLeft, CheckCircle2, Clock, Copy, Cpu, Loader2, Network, Server} from 'lucide-react';
import type {PlayerServerInfo} from '@/lib/api';
import {getPlayerServers} from '@/lib/api';
import {Navbar} from '@/components/Navbar';

export default function PlayerServersPage() {
    const router = useRouter();
    const params = useParams();
    const gameId = params.gameId as string;
    const [servers, setServers] = useState<PlayerServerInfo[]>([]);
    const [loading, setLoading] = useState(true);

    // Alert dialog state
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');

    const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
        setAlertMessage(message);
        setAlertType(type);
        setAlertOpen(true);
    };

    const fetchServers = async () => {
        if (!gameId) {
            showAlert('缺少必要的参数', 'error');
            setTimeout(() => router.push('/'), 1500);
            return;
        }

        setLoading(true);
        try {
            const res = await getPlayerServers(gameId);
            // Ensure we have an array
            setServers(Array.isArray(res.data) ? res.data : []);
        } catch (error: any) {
            console.error('Failed to fetch servers:', error);
            showAlert(error.message || '获取服务器信息失败，请检查网络或联系管理员', 'error');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showAlert('已复制到剪贴板', 'success');
        } catch (err) {
            showAlert('复制失败', 'error');
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'OK' ? 'default' : 'destructive';
    };

    const getStatusText = (status: string) => {
        return status === 'OK' ? '运行中' : '离线';
    };

    useEffect(() => {
        fetchServers();
    }, [gameId]); // Add dependency on gameId

    if (loading && servers.length === 0) {
        return (
            <main
                className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto"/>
                    <p className="text-gray-600 dark:text-gray-400">加载中...</p>
                </div>
            </main>
        );
    }

    return (
        <main
            className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center p-4 pt-24 pb-10">
            <Navbar/>

            <div className="max-w-4xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <Server className="h-6 w-6 text-indigo-600 dark:text-indigo-400"/>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600">
                                我的服务器
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                以下是您当前绑定的所有服务器信息
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => router.back()} className="w-full md:w-auto gap-2">
                        <ArrowLeft className="h-4 w-4"/>
                        返回
                    </Button>
                </div>

                {/* Content Section */}
                {servers.length === 0 ? (
                    <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
                        <CardContent className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                            <div
                                className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <Server className="h-8 w-8 text-gray-400"/>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">暂无绑定的服务器</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {servers.map((server, index) => (
                            <Card
                                key={`${server.ip}-${server.port}-${index}`}
                                className="hover:scale-[1.02] transition-all duration-300 shadow-xl border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden group"
                            >
                                <div
                                    className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"/>
                                <CardHeader className="pb-3 md:pb-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={getStatusColor(server.status) as any} className="shadow-sm">
                                                {getStatusText(server.status)}
                                            </Badge>
                                            <span
                                                className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate max-w-[150px]"
                                                title={server.nameTag}>
                         {server.nameTag}
                       </span>
                                        </div>
                                        <Badge variant="outline"
                                               className="text-xs bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300">
                                            {server.version}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Address */}
                                    <div
                                        className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-800/30 flex items-center justify-between group-hover:border-indigo-200 dark:group-hover:border-indigo-700 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Network className="h-4 w-4 text-indigo-500 flex-shrink-0"/>
                                            <div className="flex flex-col min-w-0">
                                                <span
                                                    className="text-xs text-gray-500 dark:text-gray-400">连接地址</span>
                                                <span
                                                    className="text-sm font-bold font-mono text-gray-900 dark:text-gray-100 truncate">
                            {server.ip}:{server.port}
                          </span>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={() => copyToClipboard(`${server.ip}:${server.port}`)}
                                        >
                                            <Copy
                                                className="h-4 w-4 text-gray-500 hover:text-indigo-600 transition-colors"/>
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Core */}
                                        <div
                                            className="flex flex-col space-y-1.5 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                                            <div
                                                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                <Cpu className="h-3.5 w-3.5"/>
                                                <span>核心</span>
                                            </div>
                                            <span className="text-sm font-semibold truncate" title={server.core}>
                           {server.core}
                        </span>
                                        </div>

                                        {/* Uptime */}
                                        <div
                                            className="flex flex-col space-y-1.5 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                                            <div
                                                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                <Clock className="h-3.5 w-3.5"/>
                                                <span>上线时间</span>
                                            </div>
                                            <span className="text-sm font-semibold truncate" title={server.up_time}>
                           {server.up_time}
                        </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Alert Dialog */}
            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            {alertType === 'success' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500"/>
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-500"/>
                            )}
                            {alertType === 'success' ? '成功' : '提示'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            {alertMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setAlertOpen(false)}>
                            确定
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}
