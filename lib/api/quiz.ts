import request from '@/lib/request';
import type { Question } from '@/lib/types';

/**
 * 问卷答案提交
 */
export interface QuizAnswer {
  questionId: number;
  answer: string;
  verificationId?: number;
}

/**
 * 获取问卷题目
 */
export function getQuestions(code: string) {
  return request.get('/api/v1/getQuestions', {
    params: { code }
  }) as Promise<{ data: Question[] }>;
}

/**
 * 提交问卷答案
 */
export function submitQuiz(code: string, answers: QuizAnswer[]) {
  return request.post('/api/v1/submitQuiz', {
    code,
    answers
  });
}

/**
 * 检查问卷状态
 */
export function checkQuizStatus(code: string) {
  return request.get('/api/v1/checkQuizStatus', {
    params: { code }
  }) as Promise<{ msg: string }>;
}

/**
 * 获取答题详情
 */
export function getQuizDetail(quizId: string) {
  return request.get(`/api/v1/getQuizDetail/${quizId}`) as Promise<{ data: any }>;
}
