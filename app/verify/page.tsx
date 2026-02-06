'use client';

import {Suspense, useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {checkQuizStatus, getQuestions, verifyWhitelist} from '@/lib/api';
import {AlertCircle, CheckCircle2, Loader2, XCircle} from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [redirectToQuiz, setRedirectToQuiz] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setMessage('验证码不能为空');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        // 首先检查是否有问卷题目
        try {
          const questionsRes = await getQuestions(code);

          // 如果有问卷题目且非空，检查是否已完成
          if (questionsRes.data && Array.isArray(questionsRes.data) && questionsRes.data.length > 0) {
            console.log('检测到问卷题目，检查是否已完成问卷');

            // 检查问卷状态
            try {
              const quizStatusRes = await checkQuizStatus(code);

              // 如果状态检查返回未完成问卷，重定向到问卷页面
              if (quizStatusRes && quizStatusRes.msg === "未完成问卷") {
                console.log('问卷未完成，重定向到问卷页面');
                setRedirectToQuiz(true);
                setMessage('请先完成白名单验证题目');
                setLoading(false);
                return;
              }
            } catch (statusErr) {
              console.warn('获取问卷状态失败，假设问卷未完成:', statusErr);
              setRedirectToQuiz(true);
              setMessage('请先完成白名单验证题目');
              setLoading(false);
              return;
            }
          } else {
            console.log('无问卷题目或题目为空，直接进行验证');
          }
        } catch (err) {
          console.warn('获取问卷题目失败，尝试直接验证:', err);
        }

        // 没有问卷或已完成问卷，继续验证
        const res = await verifyWhitelist(code);

        setSuccess(true);
        setMessage(res.msg || '验证成功，请等待管理员审核！');
      } catch (error: any) {
        setMessage(error.message || '验证失败');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams, router]);

  return (
      <main
          className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold">白名单验证</CardTitle>
          </CardHeader>
        <CardContent className="text-center py-8">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-500"/>
              <p className="text-muted-foreground">正在验证...</p>
            </div>
          ) : redirectToQuiz ? (
              <div className="space-y-6 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div
                    className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-blue-500"/>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{message}</p>
                  <p className="text-sm text-muted-foreground">您需要先回答几个简单的问题</p>
                </div>
                <Button onClick={() => router.push(`/quiz?code=${searchParams.get('code')}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                前往答题
              </Button>
            </div>
          ) : (
              <div className="space-y-6 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${success ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {success ? (
                      <CheckCircle2 className="h-8 w-8 text-green-500"/>
                  ) : (
                      <XCircle className="h-8 w-8 text-red-500"/>
                  )}
                </div>

                <div className="space-y-2">
                  <p className={`text-lg font-semibold ${success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {message}
                  </p>
                  {success && <p className="text-sm text-muted-foreground">管理员审核通过后即可进入服务器</p>}
                </div>

                {success ? (
                    <Button onClick={() => router.push('/')} variant="outline" className="min-w-[120px]">
                      返回首页
                    </Button>
                ) : (
                    <Button onClick={() => router.push('/')} variant="outline" className="min-w-[120px]">
                  返回首页
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <main
          className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500"/>
      </main>
    }>
      <VerifyContent />
    </Suspense>
  );
}
