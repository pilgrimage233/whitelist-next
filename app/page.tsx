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
import {Activity, ArrowRight, CheckCircle2, Clock, Edit, RefreshCw, Server, User, Users, XCircle} from 'lucide-react';
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
    <main className="min-h-screen animated-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* 顶部导航栏 */}
      <Navbar
          rightButtons={
            <>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/change-id')}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">更改ID</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/members')}
              className="flex items-center gap-1"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">查看成员</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/server-status2')}
              className="flex items-center gap-1"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">服务器信息</span>
            </Button>
            </>
          }
      />

      {/* 右上角服务器状态 - 仅在桌面端显示 */}
      <div className="hidden lg:block fixed top-24 right-5 w-80 z-10 fade-in">
        <Card className="hover-lift shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-4 w-4" />
                服务器状态
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={fetchServerStatus}
                disabled={statusLoading}
                className="h-7 w-7 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {statusLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner" />
              </div>
            ) : (
              <>
                {displayedServers.map((server, index) => (
                  <div 
                    key={server.name} 
                    className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      {server.name}
                    </div>
                    {server.players.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 font-medium">
                          <User className="h-3 w-3" />
                          在线玩家 ({server.playerCount}):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {server.players.map((player) => (
                            <Badge 
                              key={player} 
                              className="text-xs shadow-sm hover:shadow-md transition-all online-indicator"
                            >
                              {player}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 dark:text-gray-400 italic">暂无在线玩家</div>
                    )}
                  </div>
                ))}
                {showViewMore && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => router.push('/server-status')}
                    className="w-full text-xs group"
                  >
                    查看更多服务器 
                    <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
                <div className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2 flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  {serverStatus.queryTime}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 主表单 */}
      <Card className="w-full max-w-md mt-20 hover-lift shadow-lg fade-in">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold gradient-text">白名单申请</CardTitle>
          <CardDescription className="text-base">
            欢迎加入我们的服务器！请填写以下信息完成白名单申请。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 slide-in" style={{ animationDelay: '0.1s' }}>
              <Label htmlFor="userName" className="text-sm font-semibold">游戏ID</Label>
              <Input
                id="userName"
                placeholder="请输入游戏名称"
                value={form.userName}
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2 slide-in" style={{ animationDelay: '0.2s' }}>
              <Label htmlFor="qqNum" className="text-sm font-semibold">QQ号</Label>
              <Input
                id="qqNum"
                placeholder="请输入QQ号"
                value={form.qqNum}
                onChange={(e) => setForm({ ...form, qqNum: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-3 slide-in" style={{ animationDelay: '0.3s' }}>
              <Label className="text-sm font-semibold">账号类型</Label>
              <RadioGroup
                value={form.onlineFlag}
                onValueChange={(value) => setForm({ ...form, onlineFlag: value as '0' | '1' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="online" />
                  <Label htmlFor="online">正版</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="offline" />
                  <Label htmlFor="offline">离线</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2 slide-in" style={{ animationDelay: '0.4s' }}>
              <Label htmlFor="remark" className="text-sm font-semibold">备注（非必填）</Label>
              <Textarea
                id="remark"
                placeholder="请输入描述"
                value={form.remark}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
                className="min-h-[100px] resize-none"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold slide-in" 
              disabled={loading}
              style={{ animationDelay: '0.5s' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  提交中...
                </span>
              ) : (
                '提交申请'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

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
              {alertType === 'success' ? '成功' : '错误'}
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
