import request from '@/lib/request';

/**
 * 服务器状态信息
 */
export interface ServerStatus {
  name: string;
  playerCount: number;
  players: string[];
}

/**
 * 服务器详细信息
 */
export interface ServerDetail {
  '服务器名称': string;
  '连接地址': string;
  '连接端口': string;
  '版本': string;
  '核心': string;
  'Rcon连接': string;
  '在线状态': string;
  '在线人数': number;
  '最大人数': number;
  '延迟(ms)': number;
  '指标': string;
}

/**
 * 玩家服务器信息
 */
export interface PlayerServerInfo {
  status: string;
  nameTag: string;
  version: string;
  ip: string;
  port: string;
  core: string;
  up_time: string;
}

/**
 * 获取在线玩家信息
 */
export function getOnlinePlayers() {
  return request.get('/api/v1/getOnlinePlayer');
}

/**
 * 获取服务器详细状态
 */
export function getServerStatus() {
  return request.get('/api/v1/getServerStatus', {
    timeout: 20000, // 20秒超时
  });
}

/**
 * 根据游戏ID获取服务器信息
 */
export function getPlayerServers(gameId: string) {
  return request.get(`/api/v1/getServerInfoByGameId/${gameId}`);
}
