import type {ApiResponse} from '@/lib/request';
import request from '@/lib/request';

export interface VoteTemplate {
    id: number;
    templateCode: string;
    templateName: string;
    templateDesc?: string;
    minRequiredVotes: number;
    voteDurationSeconds: number;
    needReason: number;
}

export interface VoteRecord {
    id: number;
    voteId: number;
    voterUserName: string;
    voteDecision: number;
    voteComment?: string;
    createTime?: string;
}

export interface VoteInstance {
    id: number;
    templateName: string;
    templateCode: string;
    targetPlayerName?: string;
    targetWhitelistId?: number;
    initiatorUserName: string;
    requiredVotes: number;
    agreeVotes: number;
    rejectVotes: number;
    status: string;
    expireTime?: string;
    reason?: string;
    voteRecords?: VoteRecord[];
}

export interface VoteCreateForm {
    templateId: number;
    targetPlayerName?: string;
    targetWhitelistId?: number;
    reason?: string;
}

export interface VoteCastForm {
    voteId: number;
    voteDecision: 1 | 2;
    voteComment?: string;
}

export function listVoteTemplates() {
    return request.get('/api/v1/whitelist-user/vote/template/list') as Promise<ApiResponse<VoteTemplate[]>>;
}

export function listVotes(params?: {
    pageNum?: number;
    pageSize?: number;
    status?: string;
    targetPlayerName?: string
}) {
    return request.get('/api/v1/whitelist-user/vote/list', {params}) as Promise<ApiResponse<{
        rows: VoteInstance[];
        total: number
    }>>;
}

export function getVoteDetail(id: number) {
    return request.get(`/api/v1/whitelist-user/vote/${id}`) as Promise<ApiResponse<VoteInstance>>;
}

export function createVote(token: string, data: VoteCreateForm) {
    return request.post('/api/v1/whitelist-user/vote/create', data, {
        headers: {
            'Whitelist-Token': token
        }
    }) as Promise<ApiResponse<VoteInstance>>;
}

export function castVote(token: string, data: VoteCastForm) {
    return request.post('/api/v1/whitelist-user/vote/cast', data, {
        headers: {
            'Whitelist-Token': token
        }
    }) as Promise<ApiResponse<VoteInstance>>;
}
