'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Badge} from '@/components/ui/badge';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Clock, Filter, Loader2, Search, Server, Swords} from 'lucide-react';
import {checkMemberDetail, getOnlinePlayers, getWhiteList} from '@/lib/api';
import {Navbar} from '@/components/Navbar';
import {SkinViewerDialog} from '@/components/SkinViewerDialog';

// Type definitions based on backup usage
interface Member {
  name: string;
  isOnline: boolean;
  role?: string; // Optional, might be enriched from detail
}

export default function MembersPage() {
  const router = useRouter();

  // State from backup logic
  const [whitelistData, setWhitelistData] = useState<Record<string, string[]>>({});
  const [onlinePlayers, setOnlinePlayers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeServer, setActiveServer] = useState<string>('');

  // Detail dialog state
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null);
  const [memberDetail, setMemberDetail] = useState<Record<string, any> | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [skinDialogOpen, setSkinDialogOpen] = useState(false);

  // Fetch data logic from backup
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [whitelistRes, onlineRes] = await Promise.all([
          getWhiteList(),
          getOnlinePlayers(),
        ]);

        // Process whitelist data
        const whitelist: Record<string, string[]> = {};
        Object.entries(whitelistRes.data).forEach(([server, membersStr]) => {
          const members = (membersStr as string)
              .replace(/^\[|\]$/g, '')
              .split(',')
              .map((m) => m.trim())
              .filter((m) => m);
          whitelist[server] = members;
        });

        // Sort keys to ensure consistent order (maybe put Survival first if exists)
        const sortedKeys = Object.keys(whitelist).sort();
        setWhitelistData(whitelist);
        if (sortedKeys.length > 0 && !activeServer) {
          setActiveServer(sortedKeys[0]);
        }

        // Process online players
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

      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array for mount

  const handleMemberClick = async (name: string) => {
    setSelectedMemberName(name);
    setDetailLoading(true);
    setMemberDetail(null); // Clear previous
    try {
      const res = await checkMemberDetail(name);
      setMemberDetail(res.data);
    } catch (error) {
      console.error('Failed to fetch detail', error);
      // Fallback
      setMemberDetail({error: '无法获取详细信息'});
    } finally {
      setDetailLoading(false);
    }
  };

  const getFilteredMembers = () => {
    if (!activeServer || !whitelistData[activeServer]) return [];

    return whitelistData[activeServer].filter(name =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(name => ({
      name,
      isOnline: onlinePlayers.has(name)
    }));
  };

  const currentMembers = getFilteredMembers();

  return (
      <main className="min-h-screen bg-background relative">
        <Navbar/>

        <div className="container mx-auto px-4 pt-24 pb-8 min-h-[calc(100vh-60px)] flex flex-col">
          <div
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 animate-in-up">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-500">
                成员列表
              </h1>
              <p className="text-muted-foreground mt-1">
                {loading ? '加载数据中...' : `${activeServer || '服务器'} 共有 ${currentMembers.length} 位成员`}
              </p>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                <Input
                    placeholder="搜索成员..."
                    className="pl-9 bg-white/50 dark:bg-zinc-800/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* Retaining the UI filter dropdown (functional placeholder) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4"/>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>筛选排序</DropdownMenuLabel>
                  <DropdownMenuSeparator/>
                  <DropdownMenuItem>未实装功能</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {Object.keys(whitelistData).length > 0 && (
              <Tabs value={activeServer} onValueChange={setActiveServer}
                    className="w-full space-y-6 flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px] mx-auto md:mx-0 p-1 bg-muted/50 rounded-xl">
                  {Object.keys(whitelistData).map(serverKey => (
                      <TabsTrigger
                          key={serverKey}
                          value={serverKey}
                          className="py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                      >
                        {serverKey.includes('生存') ? <Swords className="w-4 h-4 mr-2"/> :
                            <Server className="w-4 h-4 mr-2"/>}
                        {serverKey}
                      </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={activeServer} className="flex-1 mt-0">
                  {loading ? (
                      <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-pulse">
                        {Array.from({length: 12}).map((_, i) => (
                            <div key={i} className="h-40 bg-muted/40 rounded-xl"></div>
                        ))}
                      </div>
                  ) : (
                      <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                        <div
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-12">
                          {currentMembers.map((member, index) => (
                              <Card
                                  key={member.name}
                                  className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border-white/20 dark:border-white/10 cursor-pointer ${index % 2 === 0 ? 'animate-in-up' : 'animate-in-up delay-75'}`}
                                  onClick={() => handleMemberClick(member.name)}
                              >
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
                                <div className="p-4 flex flex-col items-center gap-3 text-center">
                                  <div className="relative">
                                    <div
                                        className="w-16 h-16 rounded-lg overflow-hidden ring-2 ring-background shadow-lg transition-transform group-hover:scale-105">
                                      <img
                                          src={`https://minotar.net/avatar/${member.name}/100`}
                                          alt={member.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${member.name}&background=random`;
                                          }}
                                      />
                                    </div>
                                    <span
                                        className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-background ${member.isOnline ? 'bg-green-500' : 'bg-zinc-400'}`}/>
                                  </div>

                                  <div className="space-y-1 w-full overflow-hidden">
                                    <h3 className="font-semibold text-sm truncate">{member.name}</h3>
                                  </div>

                                  <div
                                      className="text-xs text-muted-foreground w-full pt-2 border-t border-dashed border-muted-foreground/20 flex justify-center items-center">
                             <span className="flex items-center gap-1">
                               <Clock className="w-3 h-3"/>
                               {member.isOnline ? '在线' : '离线'}
                             </span>
                                  </div>
                                </div>
                              </Card>
                          ))}
                        </div>
                      </ScrollArea>
                  )}
                </TabsContent>
              </Tabs>
          )}
      </div>

        <Dialog open={!!selectedMemberName && !skinDialogOpen}
                onOpenChange={(open) => !open && setSelectedMemberName(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedMemberName}</DialogTitle>
              <DialogDescription>
                {detailLoading ? '正在查询详细信息...' : '玩家信息'}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <div
                    className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  <img src={`https://minotar.net/avatar/${selectedMemberName}/100`}
                       className="w-full h-full object-cover"/>
                </div>

                {detailLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin"/> 查询中...
                    </div>
                ) : memberDetail ? (
                    <div className="space-y-1 text-sm">
                      {Object.entries(memberDetail).map(([k, v]) => {
                        if (k === 'updated' || k === 'created' || k === 'quizId' || k === '答题ID') return null; // Hide internal fields
                        return (
                            <div key={k} className="flex gap-2">
                              <span className="font-medium text-muted-foreground">{k}:</span>
                              <span>{String(v)}</span>
                            </div>
                        )
                      })}
                      {!memberDetail.error && (
                          <div className="flex gap-2">
                            <span className="font-medium text-muted-foreground">状态:</span>
                            {onlinePlayers.has(selectedMemberName!) ? (
                                <span className="text-green-600 flex items-center gap-1"><Badge
                                    className="h-2 w-2 rounded-full p-0 bg-green-500"/> 在线</span>
                            ) : (
                                <span className="text-zinc-500">离线</span>
                            )}
                          </div>
                      )}
                    </div>
                ) : null}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSkinDialogOpen(true)}>查看皮肤</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

        {/* 独立的皮肤查看 Dialog，复用原组件 */}
        <SkinViewerDialog
            open={skinDialogOpen}
            onOpenChange={(val) => {
              setSkinDialogOpen(val);
              // When skin dialog closes, if logic requires closing parent or not, handle here.
              // Usually keeping parent open is fine.
            }}
            username={selectedMemberName || ''}
      />

    </main>
  );
}
