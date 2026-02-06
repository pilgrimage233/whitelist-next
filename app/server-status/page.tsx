'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {Clock, Globe, Loader2, RefreshCw, Users} from 'lucide-react';
import {getOnlinePlayers} from '@/lib/api';
import {Navbar} from '@/components/Navbar';

// Define locally if not exported handy, or assume structure matches API
interface ServerStatus {
    name: string;
    playerCount: number;
    players: string[];
}

export default function ServerStatusPage() {
  const router = useRouter();
  const [servers, setServers] = useState<ServerStatus[]>([]);
  const [queryTime, setQueryTime] = useState('-');
  const [loading, setLoading] = useState(false);

    // No complex logic for alerts needed if we just show state
    // const [alertOpen, setAlertOpen] = useState(false);

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const res = await getOnlinePlayers();
      const data = res.data;
      const serverList: ServerStatus[] = [];

      Object.entries(data).forEach(([serverName, serverData]: [string, any]) => {
        if (serverName === '查询时间') {
          setQueryTime(serverData);
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

        serverList.push({
          name: serverName,
            playerCount: Number(serverData['在线人数']) || 0,
          players: players,
        });
      });

      setServers(serverList);
    } catch (error: any) {
      console.error('Failed to fetch server status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  return (
      <main className="min-h-screen bg-background relative selection:bg-indigo-500/30">
          <Navbar/>

          <div className="container mx-auto px-4 pt-24 pb-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 animate-in-up">
                  <div className="space-y-1 text-center md:text-left">
                      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500">
                          服务状态概览
                      </h1>
                      <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                          <Clock className="w-4 h-4"/>
                          上次更新: {queryTime}
                      </p>
                  </div>
                  <Button variant="outline" onClick={refreshStatus} className="group" disabled={loading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}/>
                      刷新状态
                  </Button>
              </div>

              {loading && servers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary"/>
                      <p className="text-muted-foreground">正在获取服务器数据...</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                      {servers.map((server, index) => (
                          <Card
                              key={server.name}
                              className={`border-indigo-500/20 shadow-lg shadow-indigo-500/5 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md animate-in-up`}
                              style={{animationDelay: `${index * 100}ms`}}
                          >
                              <CardHeader className="pb-2">
                                  <div className="flex justify-between items-center">
                                      <CardTitle className="flex items-center gap-2 text-xl truncate"
                                                 title={server.name}>
                                          <Globe className="w-5 h-5 text-indigo-500"/>
                                          {server.name}
                                      </CardTitle>
                                      <Badge variant="outline"
                                             className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1">
                                          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"/>
                                          在线
                                      </Badge>
                                  </div>
                              </CardHeader>
                              <CardContent className="space-y-6 pt-4">
                                  <div
                                      className="space-y-2 p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
                                      <div
                                          className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                                          <div className="flex items-center">
                                              <Users className="w-4 h-4 mr-2"/> 在线玩家
                                          </div>
                                          <span
                                              className="font-bold text-foreground text-lg">{server.playerCount}</span>
                                      </div>
                                      {/* Mock progress bar as max players isn't always available, assuming 100 as base or just visual */}
                                      <Progress value={Math.min((server.playerCount / 50) * 100, 100)} className="h-1.5"
                                                indicatorClassName="bg-indigo-500"/>
                                  </div>

                                  {server.players.length > 0 && (
                                      <div className="space-y-2">
                                          <div className="text-sm font-medium text-muted-foreground">玩家列表:</div>
                                          <div className="flex flex-wrap gap-2">
                                              {server.players.map(player => (
                                                  <Badge key={player} variant="secondary"
                                                         className="hover:bg-primary/10">
                                                      {player}
                                                  </Badge>
                                              ))}
                                          </div>
                                      </div>
                                  )}

                                  {server.players.length === 0 && server.playerCount > 0 && (
                                      <div className="text-sm text-muted-foreground italic text-center py-2">
                                          玩家名单隐藏或获取失败
                                      </div>
                                  )}

                                  {server.playerCount === 0 && (
                                      <div className="text-sm text-muted-foreground italic text-center py-2">
                                          当前空闲
                                      </div>
                                  )}
                              </CardContent>
                          </Card>
                      ))}
                  </div>
              )}
        </div>
    </main>
  );
}
