'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { RefreshCw, ArrowLeft, User, Loader2, XCircle, Server, Clock, FileText } from 'lucide-react';
import { getWhiteList, getOnlinePlayers, checkMemberDetail } from '@/lib/api';
import { SkinViewer } from '@/components/SkinViewer';
import { SkinViewerDialog } from '@/components/SkinViewerDialog';
import { QuizDetailDialog } from '@/components/QuizDetailDialog';

export default function MembersPage() {
  const router = useRouter();
  const [whitelistData, setWhitelistData] = useState<Record<string, string[]>>({});
  const [onlinePlayers, setOnlinePlayers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memberDetail, setMemberDetail] = useState<Record<string, any> | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
  const [skinDialogOpen, setSkinDialogOpen] = useState(false);
  const [currentSkinUsername, setCurrentSkinUsername] = useState<string>('');

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const handleViewQuizDetail = () => {
    if (!memberDetail) return;
    const quizId = memberDetail['答题ID'] || memberDetail['quizId'] || memberDetail['答题编号'];
    if (quizId) {
      setCurrentQuizId(quizId);
      setQuizDialogOpen(true);
    } else {
      showAlert('未找到答题ID');
    }
  };

  const handleSkinClick = (username: string) => {
    setCurrentSkinUsername(username);
    setSkinDialogOpen(true);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [whitelistRes, onlineRes] = await Promise.all([
        getWhiteList(),
        getOnlinePlayers(),
      ]);

      // 处理白名单数据
      const whitelist: Record<string, string[]> = {};
      Object.entries(whitelistRes.data).forEach(([server, membersStr]) => {
        const members = (membersStr as string)
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((m) => m.trim())
          .filter((m) => m);
        whitelist[server] = members;
      });
      setWhitelistData(whitelist);

      // 处理在线玩家
      const online = new Set<string>();
      Object.entries(onlineRes.data).forEach(([serverName, serverData]: [string, any]) => {
        if (serverName !== '查询时间' && serverData['在线玩家']) {
          const players = serverData['在线玩家']
            .replace(/^\[|\]$/g, '')
            .split(',')
            .map((p: string) => p.trim())
            .filter((p: string) => p);
          players.forEach((p: string) => online.add(p));
        }
      });
      setOnlinePlayers(online);
      setLastUpdate(new Date().toLocaleString());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMemberDetailHandler = async (memberId: string) => {
    setDetailLoading(true);
    setDialogOpen(true);
    setMemberDetail(null);
    
    try {
      const res = await checkMemberDetail(memberId);
      setMemberDetail(res.data);
    } catch (error: any) {
      console.error('Failed to fetch member detail:', error);
      showAlert(error.message || '获取成员详情失败');
      setDialogOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen animated-gradient p-4 pt-20">
      <div className="max-w-5xl mx-auto">
        <Card className="hover-lift shadow-lg fade-in">
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <CardTitle className="text-2xl font-bold gradient-text flex items-center gap-3">
                <User className="h-6 w-6" />
                白名单成员
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={fetchData}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  刷新
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => router.push('/')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
              💡 以下是已通过白名单审核的玩家列表，点击玩家名称查看详情
            </p>

            {Object.entries(whitelistData).map(([server, members], index) => (
              <div key={server} className="space-y-3 slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <Server className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  <h3 className="font-bold text-lg gradient-text">
                    {server}
                  </h3>
                  <Badge variant="outline" className="ml-auto">
                    {members.length} 人
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 pl-4">
                  {members.map((member) => (
                    <Badge
                      key={member}
                      variant={onlinePlayers.has(member) ? 'default' : 'secondary'}
                      className={`cursor-pointer transition-all hover:scale-110 hover:shadow-lg px-4 py-2 text-sm font-medium ${
                        onlinePlayers.has(member) 
                          ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white pulse-glow' 
                          : ''
                      }`}
                      onClick={() => checkMemberDetailHandler(member)}
                    >
                      {member}
                      {onlinePlayers.has(member) && <span className="ml-2 text-xs">●</span>}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}

            {lastUpdate && (
              <p className="text-xs text-muted-foreground text-center pt-4 flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800/50 py-3 rounded-lg">
                <Clock className="h-4 w-4" />
                最后更新：{lastUpdate}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 成员详情 Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto overflow-x-visible">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <User className="h-5 w-5" />
              <span className="gradient-text">白名单详情</span>
            </DialogTitle>
            <DialogDescription>
              玩家的详细信息
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p className="text-sm text-gray-500">加载中...</p>
            </div>
          ) : memberDetail ? (
            <>
              <div className="space-y-2">
                {Object.entries(memberDetail).map(([key, value], index) => {
                  // 如果是游戏ID且是正版账号，显示皮肤预览（悬停+点击）
                  if (key === '游戏ID' && memberDetail['账号类型'] === '正版') {
                    return (
                      <div 
                        key={key} 
                        className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover-lift border border-blue-100 dark:border-blue-800/30 slide-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{key}</span>
                        <HoverCard openDelay={200}>
                          <HoverCardTrigger asChild>
                            <span 
                              className="text-sm font-bold text-yellow-600 dark:text-yellow-400 cursor-pointer hover:text-yellow-700 dark:hover:text-yellow-300 underline decoration-dotted underline-offset-4"
                              onClick={() => handleSkinClick(String(value))}
                            >
                              {String(value)}
                            </span>
                          </HoverCardTrigger>
                          <HoverCardContent side="right" className="w-auto p-2">
                            <SkinViewer username={String(value)} width={150} height={200} />
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    );
                  }

                  // QQ号显示头像（悬停）
                  if (key === 'QQ号') {
                    return (
                      <div 
                        key={key} 
                        className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover-lift border border-blue-100 dark:border-blue-800/30 slide-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{key}</span>
                        <HoverCard openDelay={200}>
                          <HoverCardTrigger asChild>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 underline decoration-dotted underline-offset-4">
                              {String(value)}
                            </span>
                          </HoverCardTrigger>
                          <HoverCardContent side="right" className="w-auto p-2">
                            <img
                              src={`https://q1.qlogo.cn/g?b=qq&nk=${value}&s=640`}
                              alt={`QQ: ${value}`}
                              className="w-32 h-32 rounded-lg shadow-lg"
                            />
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    );
                  }

                  // 普通字段
                  return (
                    <div 
                      key={key} 
                      className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover-lift border border-blue-100 dark:border-blue-800/30 slide-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{key}</span>
                      <span className={`text-sm font-bold ${
                        key === '审核状态' ? 'text-green-600 dark:text-green-400' :
                        key === '账号类型' && value === '正版' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-gray-900 dark:text-gray-100'
                      }`}>
                        {String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
              {memberDetail['答题ID'] && (
                <DialogFooter className="mt-4">
                  <Button
                    onClick={handleViewQuizDetail}
                    className="w-full"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    查看答题详情
                  </Button>
                </DialogFooter>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* 答题详情 Dialog */}
      <QuizDetailDialog
        open={quizDialogOpen}
        onOpenChange={setQuizDialogOpen}
        quizId={currentQuizId}
      />

      {/* 皮肤预览大弹窗 */}
      <SkinViewerDialog
        open={skinDialogOpen}
        onOpenChange={setSkinDialogOpen}
        username={currentSkinUsername}
      />

      {/* Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              错误
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
