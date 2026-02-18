import type {ApiResponse} from '@/lib/request';
import request from '@/lib/request';

export interface WhitelistUserRegisterForm {
    qqNum: string;
    code: string;
    userName: string;
    password: string;
}

export interface WhitelistUserLoginForm {
    userName: string;
    password: string;
}

export interface WhitelistUserProfile {
    userId: number;
    whitelistId: number;
    userName: string;
    gameId?: string;
    qqNum: string;
    roleLevel?: number;
    roleTitle?: string;
    canInitiateVote?: number;
    token: string;
    loginTime: number;
    expireTime: number;
    checkInfo?: Record<string, unknown>;
    onlineRecords?: Array<{
        id: number;
        userName: string;
        whitelistId: number | null;
        loginTime: string;
        logoutTime: string | null;
        playMinutes: number | null;
    }>;
}

export interface WhitelistUserMe {
    userId: number;
    whitelistId: number;
    userName: string;
    qqNum: string;
    roleLevel?: number;
    roleTitle?: string;
    canInitiateVote?: number;
    token: string;
    loginTime: number;
    expireTime: number;
}

export interface WhitelistUserPrivacy {
    whitelistId: number;
    showQq: number;
    showCity: number;
    showLastOnline: number;
    showGameTime: number;
    showNameHistory: number;
    showQuizResult: number;
    showUuid: number;
}

export function sendWhitelistUserCode(qqNum: string) {
    return request.post('/api/v1/whitelist-user/sendCode', {qqNum}) as Promise<ApiResponse>;
}

export function registerWhitelistUser(data: WhitelistUserRegisterForm) {
    return request.post('/api/v1/whitelist-user/register', data) as Promise<ApiResponse>;
}

export function loginWhitelistUser(data: WhitelistUserLoginForm) {
    return request.post('/api/v1/whitelist-user/login', data) as Promise<ApiResponse<{
        token: string;
        expireTime: number
    }>>;
}

export function getWhitelistUserProfile(token: string) {
    return request.get('/api/v1/whitelist-user/profile', {
        headers: {
            'Whitelist-Token': token
        }
    }) as Promise<ApiResponse<WhitelistUserProfile>>;
}

export function getWhitelistUserMe(token: string) {
    return request.get('/api/v1/whitelist-user/me', {
        headers: {
            'Whitelist-Token': token
        }
    }) as Promise<ApiResponse<WhitelistUserMe>>;
}

export function changeWhitelistUserPassword(token: string, oldPassword: string, newPassword: string) {
    return request.post('/api/v1/whitelist-user/changePassword',
        {oldPassword, newPassword},
        {
            headers: {
                'Whitelist-Token': token
            }
        }
    ) as Promise<ApiResponse>;
}

export function changeWhitelistUserGameId(token: string, newUserName: string, changeReason?: string) {
    return request.post('/api/v1/whitelist-user/changeGameId',
        {newUserName, changeReason},
        {
            headers: {
                'Whitelist-Token': token
            }
        }
    ) as Promise<ApiResponse>;
}

export function getWhitelistUserPrivacy(token: string) {
    return request.get('/api/v1/whitelist-user/privacy', {
        headers: {
            'Whitelist-Token': token
        }
    }) as Promise<ApiResponse<WhitelistUserPrivacy>>;
}

export function updateWhitelistUserPrivacy(token: string, data: Partial<WhitelistUserPrivacy>) {
    return request.post('/api/v1/whitelist-user/privacy', data, {
        headers: {
            'Whitelist-Token': token
        }
    }) as Promise<ApiResponse>;
}
