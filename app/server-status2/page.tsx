'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
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
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  Loader2,
  Network,
  RefreshCw,
  Server,
  Timer,
  User
} from 'lucide-react';
import type {ServerDetail} from '@/lib/api';
import {getServerStatus} from '@/lib/api';
import {Navbar} from '@/components/Navbar';

export default function ServerStatus2Page() {
  const router = useRouter();
  const [servers, setServers] = useState<ServerDetail[]>([]);
  const [queryTime, setQueryTime] = useState('-');
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertOpen(true);
  };

  const fetchServerStatus = async () => {
    setLoading(true);
    try {
      const res = await getServerStatus();
      setServers(Array.isArray(res.data) ? res.data : []);
      setQueryTime(new Date().toLocaleString('zh-CN'));
    } catch (error: any) {
      console.error('Failed to fetch server status:', error);
      showAlert(error.message || '获取服务器状态失败，请稍后重试', 'error');
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
    return status === '在线' ? 'default' : 'destructive';
  };

  const getStatusText = (status: string) => {
    return status === '在线' ? '运行中' : '离线';
  };

  const getIndicatorColor = (indicator: string) => {
    if (indicator === '服务正常') return 'default';
    if (indicator === '服务降级') return 'secondary';
    return 'destructive';
  };

  const getRconColor = (rcon: string) => {
    return rcon === '成功' ? 'default' : 'destructive';
  };

  useEffect(() => {
    fetchServerStatus();
  }, []);

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
          className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 pt-24 pb-10">
        <Navbar/>

        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600 flex items-center gap-3">
              <Server className="h-8 w-8 text-indigo-600"/>
              服务器详情监控
            </h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()}
                      className="border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900/20">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                返回
              </Button>
              <Button onClick={fetchServerStatus} disabled={loading}
                      className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-md">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}/>
                刷新状态
              </Button>
            </div>
          </div>

        {servers.length === 0 ? (
            <Card className="shadow-lg border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
            <CardContent className="py-20 text-center text-gray-500">
              暂无服务器数据
            </CardContent>
          </Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map((server, index) => (
              <Card 
                key={`${server['连接地址']}-${server['连接端口']}-${index}`}
                className="hover:scale-[1.02] transition-transform duration-300 shadow-xl border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden"
              >
                <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"/>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(server['在线状态']) as any} className="font-semibold shadow-sm">
                        {getStatusText(server['在线状态'])}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono bg-gray-50 dark:bg-gray-900/50">
                      {server['版本']}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2 font-bold text-gray-900 dark:text-gray-100">
                    {server['服务器名称']}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 连接地址 */}
                  <div
                      className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-800/30 group">
                    <div className="flex items-start gap-2 text-sm">
                      <Network className="h-4 w-4 mt-0.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">连接地址</div>
                        <div className="text-gray-900 dark:text-gray-100 font-mono text-xs break-all font-bold">
                          {server['连接地址']}:{server['连接端口']}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(`${server['连接地址']}:${server['连接端口']}`)}
                      >
                        <Copy className="h-3 w-3 text-indigo-500"/>
                      </Button>
                    </div>
                  </div>

                  {/* 服务器信息网格 */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* 核心 */}
                    <div
                        className="p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <Cpu className="h-3.5 w-3.5"/>
                        核心
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate"
                           title={server['核心']}>
                        {server['核心']}
                      </div>
                    </div>

                    {/* Rcon */}
                    <div
                        className="p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <Activity className="h-3.5 w-3.5"/>
                        Rcon
                      </div>
                      <Badge variant={getRconColor(server['Rcon连接']) as any} className="text-xs h-5">
                        {server['Rcon连接']}
                      </Badge>
                    </div>

                    {/* 在线人数 */}
                    <div
                        className="p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <User className="h-3.5 w-3.5"/>
                        在线
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {server['在线人数'] ?? '-'} <span
                          className="text-gray-400 text-xs">/ {server['最大人数'] ?? '-'}</span>
                      </div>
                    </div>

                    {/* 延迟 */}
                    <div
                        className="p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <Timer className="h-3.5 w-3.5"/>
                        延迟
                      </div>
                      <div className={`text-sm font-semibold ${
                          (server['延迟(ms)'] || 0) > 200 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {server['延迟(ms)'] ?? '-'} ms
                      </div>
                    </div>
                  </div>

                  {/* 指标 */}
                  <div
                      className="flex items-center justify-between p-3 bg-cyan-50/50 dark:bg-cyan-900/10 rounded-lg border border-cyan-100 dark:border-cyan-800/30">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">服务指标</span>
                    <Badge variant={getIndicatorColor(server['指标']) as any} className="text-xs font-semibold">
                      {server['指标']}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

          <div
              className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 bg-white/50 dark:bg-gray-800/50 py-3 rounded-full w-fit mx-auto px-6 backdrop-blur-sm shadow-sm">
          <Clock className="h-4 w-4" />
            上次更新: {queryTime}
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {alertType === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
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
