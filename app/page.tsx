'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
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
import {Activity, ArrowRight, CheckCircle2, Clock, Edit, RefreshCw, Server, Users, XCircle} from 'lucide-react';
import type {WhitelistForm} from '@/lib/api';
import {applyWhitelist, getOnlinePlayers} from '@/lib/api';
import {Navbar} from '@/components/Navbar';

interface ServerStatus {
  name: string;
  playerCount: number;
  players: string[];
}

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState<WhitelistForm>({
    userName: '',
    qqNum: '',
    onlineFlag: '1',
    remark: '',
  });
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<{
    servers: ServerStatus[];
    queryTime: string;
  }>({ servers: [], queryTime: '-' });
  const [statusLoading, setStatusLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertOpen(true);
  };

  const fetchServerStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await getOnlinePlayers();
      const data = res.data;
      const servers: ServerStatus[] = [];

      Object.entries(data).forEach(([serverName, serverData]: [string, any]) => {
        if (serverName === '查询时间') {
          setServerStatus(prev => ({ ...prev, queryTime: serverData }));
          return;
        }

        let players: string[] = [];
        const playersStr = serverData['在线玩家'];
        if (playersStr) {
          players = playersStr
            .replace(/^\[|\]$/g, '')
            .split(',')
            .map((p: string) => p.trim())
            .filter((p: string) => p);
        }

        servers.push({
          name: serverName,
          playerCount: serverData['在线人数'],
          players: players,
        });
      });

      setServerStatus(prev => ({ ...prev, servers }));
    } catch (error) {
      console.error('Failed to fetch server status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.userName || !form.qqNum || !form.onlineFlag) {
      showAlert('请填写完整信息', 'error');
      return;
    }

    if (!/^\d{5,11}$/.test(form.qqNum)) {
      showAlert('QQ号格式错误', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await applyWhitelist(form);
      showAlert(res.msg || '申请提交成功', 'success');
      setForm({ userName: '', qqNum: '', onlineFlag: '1', remark: '' });
    } catch (error: any) {
      showAlert(error.message || '提交失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const displayedServers = serverStatus.servers.slice(0, 3);
  const showViewMore = serverStatus.servers.length > 3;

  return (
      <main className="min-h-screen relative overflow-hidden bg-background">
          <Navbar/>

          <div className="container mx-auto px-4 pt-24 pb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
                  {/* 左侧主要内容区 */}
                  <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                      {/* 欢迎语 */}
                      <div className="animate-in-up space-y-4">
                          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:to-blue-400">
                              加入我们的世界
                          </h1>
                          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                              欢迎来到白名单申请系统。请填写下方表单，我们将尽快审核您的申请。请确保提供真实有效的游戏ID和联系方式。
                          </p>
                      </div>

                      {/* 表单卡片 */}
                      <Card
                          className="border-none shadow-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md animate-in-up delay-100 ring-1 ring-black/5 dark:ring-white/10">
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-2xl">
                                  <Edit className="w-6 h-6 text-primary"/>
                                  申请表单
                              </CardTitle>
                              <CardDescription>
                                  带 * 为必填项
                              </CardDescription>
                          </CardHeader>
                          <CardContent>
                              <form onSubmit={handleSubmit} className="space-y-6">
                                  <div className="space-y-2">
                                      <Label htmlFor="userName" className="text-sm font-semibold">游戏ID *</Label>
                                      <Input
                                          id="userName"
                                          placeholder="请输入游戏名称"
                                          value={form.userName}
                                          onChange={(e) => setForm({...form, userName: e.target.value})}
                                          className="h-11 bg-white/50 dark:bg-zinc-800/50"
                                      />
                                  </div>

                                  <div className="space-y-2">
                                      <Label htmlFor="qqNum" className="text-sm font-semibold">QQ号 *</Label>
                                      <Input
                                          id="qqNum"
                                          placeholder="请输入QQ号"
                                          value={form.qqNum}
                                          onChange={(e) => setForm({...form, qqNum: e.target.value})}
                                          className="h-11 bg-white/50 dark:bg-zinc-800/50"
                                      />
                                  </div>

                                  <div className="space-y-3">
                                      <Label className="text-sm font-semibold">账号类型 *</Label>
                                      <RadioGroup
                                          value={form.onlineFlag}
                                          onValueChange={(value) => setForm({...form, onlineFlag: value as '0' | '1'})}
                                          className="flex gap-6"
                                      >
                                          <div
                                              className="flex items-center space-x-2 border rounded-lg p-3 w-full bg-white/30 dark:bg-zinc-800/30 hover:bg-white/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                              onClick={() => setForm({...form, onlineFlag: '1'})}>
                                              <RadioGroupItem value="1" id="online"/>
                                              <Label htmlFor="online" className="cursor-pointer flex-1">正版认证</Label>
                                          </div>
                                          <div
                                              className="flex items-center space-x-2 border rounded-lg p-3 w-full bg-white/30 dark:bg-zinc-800/30 hover:bg-white/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                              onClick={() => setForm({...form, onlineFlag: '0'})}>
                                              <RadioGroupItem value="0" id="offline"/>
                                              <Label htmlFor="offline"
                                                     className="cursor-pointer flex-1">离线模式</Label>
                                          </div>
                                      </RadioGroup>
                                  </div>

                                  <div className="space-y-2">
                                      <Label htmlFor="remark" className="text-sm font-semibold">备注</Label>
                                      <Textarea
                                          id="remark"
                                          placeholder="有什么想对管理员说的吗？"
                                          value={form.remark}
                                          onChange={(e) => setForm({...form, remark: e.target.value})}
                                          className="min-h-[100px] resize-none bg-white/50 dark:bg-zinc-800/50"
                                      />
                                  </div>

                                  <Button
                                      type="submit"
                                      size="lg"
                                      className="w-full text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                                      disabled={loading}
                                  >
                                      {loading ? (
                                          <span className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin"/>
                            提交中...
                          </span>
                                      ) : (
                                          '提交申请'
                                      )}
                                  </Button>
                              </form>
                          </CardContent>
                      </Card>
                  </div>

                  {/* 右侧边栏 */}
                  <div className="lg:col-span-5 xl:col-span-4 space-y-6 animate-in-up delay-200">
                      {/* 快捷操作 Card - 样式优化版 */}
                      <Card
                          className="border-none shadow-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10 text-card-foreground">
                          <CardHeader className="pb-3 border-b border-border/50">
                              <CardTitle className="text-lg flex items-center gap-2 font-medium">
                                  <Activity className="w-5 h-5 text-indigo-500"/>
                                  快捷导航
                              </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 gap-3 pt-4">
                              <Button variant="ghost"
                                      className="h-auto py-6 flex flex-col gap-3 bg-white/40 dark:bg-black/20 border border-border/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 group rounded-xl shadow-sm"
                                      onClick={() => router.push('/change-id')}>
                                  <div
                                      className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                      <Edit className="h-5 w-5 text-indigo-600 dark:text-indigo-400"/>
                                  </div>
                                  <span className="font-semibold text-sm">更改ID</span>
                              </Button>
                              <Button variant="ghost"
                                      className="h-auto py-6 flex flex-col gap-3 bg-white/40 dark:bg-black/20 border border-border/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 group rounded-xl shadow-sm"
                                      onClick={() => router.push('/members')}>
                                  <div
                                      className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400"/>
                                  </div>
                                  <span className="font-semibold text-sm">查看成员</span>
                              </Button>
                              <Button variant="ghost"
                                      className="col-span-2 h-auto py-4 flex flex-row items-center justify-between px-6 bg-white/40 dark:bg-black/20 border border-border/50 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-300 group rounded-xl shadow-sm"
                                      onClick={() => router.push('/server-status2')}>
                                  <div className="flex items-center gap-3">
                                      <div
                                          className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                          <Server className="h-4 w-4 text-cyan-600 dark:text-cyan-400"/>
                                      </div>
                                      <span className="font-semibold text-sm">详细服务器信息</span>
                                  </div>
                                  <ArrowRight
                                      className="h-4 w-4 text-muted-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"/>
                              </Button>
                          </CardContent>
                      </Card>

                      {/* 服务器状态 Card */}
                      <Card
                          className="border-none shadow-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10">
                          <CardHeader className="pb-3 border-b border-border/50 mb-3">
                              <div className="flex items-center justify-between">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                      <Activity className="h-5 w-5 text-orange-500"/>
                                      实时状态
                                  </CardTitle>
                                  <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={fetchServerStatus}
                                      disabled={statusLoading}
                                      className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                                  >
                                      <RefreshCw className={`h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`}/>
                                  </Button>
                              </div>
                          </CardHeader>
                          <CardContent className="space-y-4 p-0 px-6 pb-6">
                              {statusLoading ? (
                                  <div
                                      className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
                                      <RefreshCw className="h-8 w-8 animate-spin opacity-50"/>
                                      <p className="text-sm">正在获取状态...</p>
                                  </div>
                              ) : (
                                  <>
                                      {displayedServers.length === 0 ? (
                                          <div
                                              className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                                              暂无服务器信息
                                          </div>
                                      ) : (
                                          displayedServers.map((server, index) => (
                                              <div
                                                  key={server.name}
                                                  className="group space-y-3 p-4 bg-muted/40 hover:bg-muted/60 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-all duration-300 ring-1 ring-border/50"
                                              >
                                                  <div className="flex items-center justify-between">
                                                      <div
                                                          className="font-semibold text-foreground flex items-center gap-2">
                                                          <div
                                                              className="w-2 h-2 rounded-full bg-green-500 box-shadow-glow-green"/>
                                                          {server.name}
                                                      </div>
                                                      <Badge variant="secondary"
                                                             className="px-2 py-0.5 text-xs font-normal">
                                                          {server.playerCount} 人在线
                                                      </Badge>
                                                  </div>

                                                  {server.players.length > 0 ? (
                                                      <div className="flex flex-wrap gap-1.5 pt-1">
                                                          {server.players.map((player) => (
                                                              <Badge
                                                                  key={player}
                                                                  variant="outline"
                                                                  className="text-xs bg-background/50 hover:bg-background border-border/50 transition-colors"
                                                              >
                                                                  {player}
                                                              </Badge>
                                                          ))}
                                                      </div>
                                                  ) : (
                                                      <div
                                                          className="text-xs text-muted-foreground italic pl-4 border-l-2 border-muted">暂无玩家在线</div>
                                                  )}
                                              </div>
                                          ))
                                      )}

                                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                                              <Clock className="h-3 w-3"/>
                                              Updated: {serverStatus.queryTime}
                                          </div>
                                          {showViewMore && (
                                              <Button
                                                  variant="link"
                                                  size="sm"
                                                  onClick={() => router.push('/server-status')}
                                                  className="text-xs h-auto p-0 text-primary"
                                              >
                                                  查看全部
                                              </Button>
                                          )}
                                      </div>
                                  </>
                              )}
                          </CardContent>
                      </Card>
                  </div>
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
                <XCircle className="h-5 w-5 text-red-500" />
              )}
                {alertType === 'success' ? '操作成功' : '操作失败'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogAction onClick={() => setAlertOpen(false)} className="bg-primary hover:bg-primary/90">
                  我知道了
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
