'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { XCircle } from 'lucide-react';
import { getQuestions, submitQuiz } from '@/lib/api';
import type { Question } from '@/lib/types';

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertOpen(true);
  };

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      showAlert('无效的验证链接');
      router.push('/');
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res = await getQuestions(code);

        if (!res.data || res.data.length === 0) {
          router.push(`/verify?code=${code}`);
          return;
        }

        const sortedQuestions = res.data.sort((a: Question, b: Question) => a.sortOrder - b.sortOrder);
        setQuestions(sortedQuestions);

        // 初始化答案
        const initialAnswers: Record<number, string | string[]> = {};
        sortedQuestions.forEach((q: Question) => {
          initialAnswers[q.id] = q.questionType === 2 ? [] : '';
        });
        setAnswers(initialAnswers);
      } catch (error: any) {
        console.error('Failed to fetch questions:', error);
        showAlert(error.message || '获取题目失败');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [searchParams, router]);

  const handleSubmit = async () => {
    const code = searchParams.get('code');
    if (!code) return;

    // 验证必答题
    for (const question of questions) {
      if (question.isRequired === 1) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          showAlert(`请回答必答题目: ${question.questionText}`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
        const question = questions.find((q) => q.id === parseInt(questionId));
        return {
          questionId: parseInt(questionId),
          answer: Array.isArray(answer) ? answer.join(',') : String(answer || ''),
          verificationId: question?.questionType === 4 ? question.verificationId : undefined,
        };
      });

      await submitQuiz(code, formattedAnswers);

      router.push(`/verify?code=${code}`);
    } catch (error: any) {
      showAlert(error.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckboxChange = (questionId: number, optionId: string, checked: boolean) => {
    const currentAnswers = (answers[questionId] as string[]) || [];
    const newAnswers = checked
      ? [...currentAnswers, optionId]
      : currentAnswers.filter((id) => id !== optionId);
    setAnswers({ ...answers, [questionId]: newAnswers });
  };

  if (loading) {
    return (
      <main className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="spinner" />
      </main>
    );
  }

  return (
    <main className="min-h-screen animated-gradient p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>白名单验证题目</CardTitle>
            <CardDescription>
              请完成以下问题以继续验证流程
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-base font-medium">
                  {question.questionText}
                  {question.isRequired === 1 && <span className="text-red-500 ml-1">*</span>}
                </Label>

                {question.questionType === 1 && (
                  <RadioGroup
                    value={answers[question.id] as string}
                    onValueChange={(value) =>
                      setAnswers({ ...answers, [question.id]: value })
                    }
                  >
                    {question.whitelistQuizAnswerVoList?.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={String(option.id)} id={`q${question.id}-${option.id}`} />
                        <Label htmlFor={`q${question.id}-${option.id}`} className="font-normal">
                          {option.answerText}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.questionType === 2 && (
                  <div className="space-y-2">
                    {question.whitelistQuizAnswerVoList?.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`q${question.id}-${option.id}`}
                          checked={(answers[question.id] as string[])?.includes(String(option.id))}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(question.id, String(option.id), checked as boolean)
                          }
                        />
                        <Label htmlFor={`q${question.id}-${option.id}`} className="font-normal">
                          {option.answerText}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {(question.questionType === 3 || question.questionType === 4) && (
                  <Input
                    placeholder="请输入您的回答"
                    value={answers[question.id] as string}
                    onChange={(e) =>
                      setAnswers({ ...answers, [question.id]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}

            <Button
              size="lg"
              disabled={submitting}
              onClick={handleSubmit}
              className="w-full"
            >
              {submitting ? '提交中...' : '提交并继续验证'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              提示
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertOpen(false)}>
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="spinner" />
      </main>
    }>
      <QuizContent />
    </Suspense>
  );
}
