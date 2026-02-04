'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getQuestions, checkQuizStatus, verifyWhitelist } from '@/lib/api';

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
    <main className="min-h-screen animated-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-8">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="spinner" />
              <p>正在验证...</p>
            </div>
          ) : redirectToQuiz ? (
            <div className="space-y-4">
              <p className="text-blue-600 font-medium">{message}</p>
              <Button onClick={() => router.push(`/quiz?code=${searchParams.get('code')}`)} variant="default">
                前往答题
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className={success ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {message}
              </p>
              {success && (
                <Button onClick={() => router.push('/')} variant="outline">
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
      <main className="min-h-screen animated-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="spinner" />
              <p>正在验证...</p>
            </div>
          </CardContent>
        </Card>
      </main>
    }>
      <VerifyContent />
    </Suspense>
  );
}
