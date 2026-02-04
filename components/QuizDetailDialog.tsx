'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, FileText } from 'lucide-react';
import { getQuizDetail } from '@/lib/api';

interface QuizDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string | null;
}

const questionTypeMap: Record<number, string> = {
  1: '单选题',
  2: '多选题',
  3: '填空题',
  4: '随机验证'
};

export function QuizDetailDialog({ open, onOpenChange, quizId }: QuizDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [quizDetail, setQuizDetail] = useState<any>(null);

  useEffect(() => {
    if (open && quizId) {
      loadQuizDetail();
    }
  }, [open, quizId]);

  const loadQuizDetail = async () => {
    if (!quizId) return;

    setLoading(true);
    try {
      const res = await getQuizDetail(quizId);
      setQuizDetail(res.data);
    } catch (error) {
      console.error('获取答题详情失败：', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (val: any) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      return `${y}-${m}-${day} ${h}:${min}:${s}`;
    } catch (e) {
      return String(val);
    }
  };

  const renderQuizDetails = (details: any[]) => {
    return details.map((q: any, idx: number) => (
      <div key={idx} className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">问题类型</span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {questionTypeMap[q['问题类型']] || q['问题类型']}
          </span>
        </div>
        
        {q['问题类型'] !== 4 ? (
          <>
            {q['问题内容'] && (
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 shrink-0">问题内容</span>
                <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{q['问题内容']}</span>
              </div>
            )}
            {q['玩家答案'] && (
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 shrink-0">玩家答案</span>
                <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{q['玩家答案']}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">是否正确</span>
              <span className={`text-sm font-bold ${q['是否正确'] === '正确' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {q['是否正确']}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">得分</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{q['得分']}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">随机验证</span>
            <span className={`text-sm font-bold ${q['是否正确'] === '正确' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {q['是否正确']}
            </span>
          </div>
        )}
        
        {idx < details.length - 1 && (
          <div className="h-px bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-transparent mt-4" />
        )}
      </div>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <FileText className="h-5 w-5" />
            <span className="gradient-text">答题详情</span>
          </DialogTitle>
          <DialogDescription>
            查看玩家的答题记录和得分情况
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">加载中...</p>
          </div>
        ) : quizDetail ? (
          <div className="space-y-3">
            {Object.entries(quizDetail).map(([key, value]: [string, any], index) => {
              // 答题详情列表特殊处理
              if (key === '答题详情' && Array.isArray(value)) {
                return (
                  <div key={key} className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{key}</h3>
                    {value.length > 0 ? (
                      <div className="space-y-3">
                        {renderQuizDetails(value)}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">暂无数据</p>
                    )}
                  </div>
                );
              }

              // 其他数组类型
              if (Array.isArray(value)) {
                return (
                  <div key={key} className="space-y-2">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">{key}</h3>
                    {value.length > 0 ? (
                      value.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-1">
                          {Object.entries(item).map(([k, v]: [string, any]) => {
                            if (k === '@type') return null;
                            return (
                              <div key={k} className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{k}</span>
                                <span className="text-sm text-gray-900 dark:text-gray-100">{String(v)}</span>
                              </div>
                            );
                          })}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-2">暂无数据</p>
                    )}
                  </div>
                );
              }

              // 普通键值对
              return (
                <div
                  key={key}
                  className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover-lift border border-blue-100 dark:border-blue-800/30 slide-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{key}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {key === '提交时间' ? formatDate(value) : String(value)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
