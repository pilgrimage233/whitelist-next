'use client';

import {useEffect, useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Navbar} from '@/components/Navbar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {
    castVote,
    createVote,
    getVoteDetail,
    getWhitelistUserProfile,
    listVotes,
    listVoteTemplates,
    type VoteInstance,
    type VoteTemplate
} from '@/lib/api';
import {CheckCircle2, Loader2, Vote} from 'lucide-react';

const TOKEN_KEY = 'whitelistUserToken';

export default function VotePage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [roleTitle, setRoleTitle] = useState<string>('成员');
    const [canInitiateVote, setCanInitiateVote] = useState(false);

    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<VoteTemplate[]>([]);
    const [votes, setVotes] = useState<VoteInstance[]>([]);
    const [status, setStatus] = useState('ONGOING');

    const [createOpen, setCreateOpen] = useState(false);
    const [castOpen, setCastOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [currentVote, setCurrentVote] = useState<VoteInstance | null>(null);

    const [createForm, setCreateForm] = useState({
        templateId: 0,
        targetPlayerName: '',
        targetWhitelistId: '',
        reason: ''
    });

    const [castForm, setCastForm] = useState({
        voteId: 0,
        voteDecision: 1 as 1 | 2,
        voteComment: ''
    });

    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const selectedTemplate = useMemo(
        () => templates.find(item => item.id === Number(createForm.templateId)),
        [templates, createForm.templateId]
    );

    const showError = (message: string) => setAlert({type: 'error', message});
    const showSuccess = (message: string) => setAlert({type: 'success', message});

    const fetchVoteData = async () => {
        setLoading(true);
        try {
            const [templateRes, voteRes] = await Promise.all([
                listVoteTemplates(),
                listVotes({pageNum: 1, pageSize: 20, status})
            ]);
            setTemplates(templateRes.data || []);
            setVotes((voteRes as any).rows || (voteRes as any).data?.rows || []);
            if ((templateRes.data || []).length > 0 && !createForm.templateId) {
                setCreateForm(prev => ({...prev, templateId: templateRes.data![0].id}));
            }
        } catch (e: any) {
            showError(e.message || '加载投票数据失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const localToken = localStorage.getItem(TOKEN_KEY);
        setToken(localToken);
        const localRoleTitle = localStorage.getItem('whitelistUserRoleTitle');
        const localCanInitiate = localStorage.getItem('whitelistUserCanInitiateVote');
        if (localRoleTitle) {
            setRoleTitle(localRoleTitle);
        }
        if (localCanInitiate === '1') {
            setCanInitiateVote(true);
        }

        if (localToken) {
            getWhitelistUserProfile(localToken).then(res => {
                const profile = res.data;
                if (profile?.roleTitle) {
                    setRoleTitle(profile.roleTitle);
                    localStorage.setItem('whitelistUserRoleTitle', profile.roleTitle);
                }
                if (profile?.canInitiateVote !== undefined && profile?.canInitiateVote !== null) {
                    const canInitiate = Number(profile.canInitiateVote) === 1;
                    setCanInitiateVote(canInitiate);
                    localStorage.setItem('whitelistUserCanInitiateVote', canInitiate ? '1' : '0');
                }
            }).catch(() => {
                // ignore profile fetch failures for read-only view
            });
        }
    }, []);

    useEffect(() => {
        fetchVoteData();
    }, [status]);

    const handleOpenCreate = () => {
        if (!token) {
            showError('请先登录后再发起投票');
            router.push('/login');
            return;
        }
        if (!canInitiateVote) {
            showError('当前头衔权限不足，仅代表成员及以上可发起投票');
            return;
        }
        setCreateOpen(true);
    };

    const handleCreateVote = async () => {
        if (!token) {
            showError('请先登录');
            return;
        }
        if (!createForm.templateId) {
            showError('请选择投票类型');
            return;
        }
        if (!createForm.targetPlayerName && !createForm.targetWhitelistId) {
            showError('目标玩家或白名单ID至少填写一个');
            return;
        }
        if ((selectedTemplate?.needReason || 0) === 1 && !createForm.reason.trim()) {
            showError('该投票必须填写原因');
            return;
        }

        try {
            await createVote(token, {
                templateId: Number(createForm.templateId),
                targetPlayerName: createForm.targetPlayerName || undefined,
                targetWhitelistId: createForm.targetWhitelistId ? Number(createForm.targetWhitelistId) : undefined,
                reason: createForm.reason || undefined
            });
            showSuccess('发起投票成功');
            setCreateOpen(false);
            setCreateForm(prev => ({...prev, targetPlayerName: '', targetWhitelistId: '', reason: ''}));
            fetchVoteData();
        } catch (e: any) {
            showError(e.message || '发起投票失败');
        }
    };

    const handleOpenCast = (vote: VoteInstance) => {
        if (!token) {
            showError('请先登录后再参与投票');
            router.push('/login');
            return;
        }
        setCastForm({voteId: vote.id, voteDecision: 1, voteComment: ''});
        setCastOpen(true);
    };

    const handleCastVote = async () => {
        if (!token) {
            showError('请先登录');
            return;
        }
        try {
            await castVote(token, castForm);
            showSuccess('投票成功');
            setCastOpen(false);
            fetchVoteData();
        } catch (e: any) {
            showError(e.message || '投票失败');
        }
    };

    const handleOpenDetail = async (vote: VoteInstance) => {
        try {
            const res = await getVoteDetail(vote.id);
            setCurrentVote(res.data || (res as any).data);
            setDetailOpen(true);
        } catch (e: any) {
            showError(e.message || '获取详情失败');
        }
    };

    return (
        <main className="min-h-screen bg-background">
            <Navbar/>
            <div className="container mx-auto px-4 pt-24 pb-10 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2"><Vote
                            className="w-6 h-6 text-primary"/>玩家投票</h1>
                        <p className="text-muted-foreground mt-2">已登录用户可参与投票；仅代表成员及以上可发起投票。</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">当前头衔：{roleTitle}</Badge>
                        <Button onClick={handleOpenCreate}>发起投票</Button>
                    </div>
                </div>

                {alert && (
                    <div
                        className={`rounded-lg border px-3 py-2 text-sm ${alert.type === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-red-300 bg-red-50 text-red-700'}`}>
                        {alert.message}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button variant={status === 'ONGOING' ? 'default' : 'outline'}
                            onClick={() => setStatus('ONGOING')}>进行中</Button>
                    <Button variant={status === 'PASSED' ? 'default' : 'outline'}
                            onClick={() => setStatus('PASSED')}>已通过</Button>
                    <Button variant={status === 'REJECTED' ? 'default' : 'outline'}
                            onClick={() => setStatus('REJECTED')}>已拒绝</Button>
                    <Button variant={status === 'EXPIRED' ? 'default' : 'outline'}
                            onClick={() => setStatus('EXPIRED')}>已过期</Button>
                </div>

                {loading ? (
                    <div className="py-16 flex items-center justify-center text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin mr-2"/>加载中...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {votes.map(vote => (
                            <Card key={vote.id} className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <span>{vote.templateName}</span>
                                        <Badge>{vote.status}</Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        目标：{vote.targetPlayerName || '-'} · 发起人：{vote.initiatorUserName}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>票数：<span
                                        className="font-semibold">{vote.agreeVotes}/{vote.requiredVotes}</span>（反对 {vote.rejectVotes}）
                                    </div>
                                    <div>到期：{vote.expireTime ? new Date(vote.expireTime).toLocaleString() : '-'}</div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm"
                                                onClick={() => handleOpenDetail(vote)}>详情</Button>
                                        {vote.status === 'ONGOING' && (
                                            <Button size="sm" onClick={() => handleOpenCast(vote)}>参与投票</Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {votes.length === 0 && (
                            <div className="col-span-full text-center py-14 text-muted-foreground">暂无投票数据</div>
                        )}
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>发起投票</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>投票类型</Label>
                            <select
                                className="w-full border rounded-md px-3 py-2 bg-background"
                                value={createForm.templateId}
                                onChange={(e) => setCreateForm(prev => ({...prev, templateId: Number(e.target.value)}))}
                            >
                                {templates.map(item => (
                                    <option key={item.id} value={item.id}>{item.templateName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>目标玩家</Label>
                            <Input
                                value={createForm.targetPlayerName}
                                onChange={(e) => setCreateForm(prev => ({...prev, targetPlayerName: e.target.value}))}
                                placeholder="请输入目标玩家"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>白名单ID（可选）</Label>
                            <Input
                                value={createForm.targetWhitelistId}
                                onChange={(e) => setCreateForm(prev => ({...prev, targetWhitelistId: e.target.value}))}
                                placeholder="例如 1001"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>发起原因</Label>
                            <Textarea
                                value={createForm.reason}
                                onChange={(e) => setCreateForm(prev => ({...prev, reason: e.target.value}))}
                                placeholder="请输入发起原因"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
                        <Button onClick={handleCreateVote}>确认发起</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={castOpen} onOpenChange={setCastOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>参与投票</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>投票选择</Label>
                            <div className="flex gap-2">
                                <Button variant={castForm.voteDecision === 1 ? 'default' : 'outline'}
                                        onClick={() => setCastForm(prev => ({...prev, voteDecision: 1}))}>同意</Button>
                                <Button variant={castForm.voteDecision === 2 ? 'default' : 'outline'}
                                        onClick={() => setCastForm(prev => ({...prev, voteDecision: 2}))}>反对</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>备注</Label>
                            <Textarea
                                value={castForm.voteComment}
                                onChange={(e) => setCastForm(prev => ({...prev, voteComment: e.target.value}))}
                                placeholder="可选"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCastOpen(false)}>取消</Button>
                        <Button onClick={handleCastVote}>提交投票</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>投票详情</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 text-sm">
                        <div>类型：{currentVote?.templateName}</div>
                        <div>状态：{currentVote?.status}</div>
                        <div>目标：{currentVote?.targetPlayerName || '-'}</div>
                        <div>票数：{currentVote?.agreeVotes}/{currentVote?.requiredVotes}（反对 {currentVote?.rejectVotes}）</div>
                        <div>发起原因：{currentVote?.reason || '-'}</div>
                        <div className="pt-2 font-medium">投票记录</div>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                            {(currentVote?.voteRecords || []).map(record => (
                                <div key={record.id}
                                     className="px-2 py-1 rounded bg-muted/50 flex items-center justify-between">
                                    <span>{record.voterUserName}</span>
                                    <span className="flex items-center gap-1 text-xs">
                                        <CheckCircle2 className="w-3 h-3"/>{record.voteDecision === 1 ? '同意' : '反对'}
                                    </span>
                                </div>
                            ))}
                            {(currentVote?.voteRecords || []).length === 0 && (
                                <div className="text-muted-foreground text-xs">暂无投票记录</div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
}
