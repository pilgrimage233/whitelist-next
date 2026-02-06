'use client';

import {Suspense, useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Checkbox} from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {AlertCircle, CheckCircle2, Loader2} from 'lucide-react';
import {getQuestions, submitQuiz} from '@/lib/api';
import type {Question} from '@/lib/types';
import {Navbar} from '@/components/Navbar';

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');

  const showAlert = (message: string, type: 'success' | 'error' = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertOpen(true);
  };

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      showAlert('无效的验证链接', 'error');
      setTimeout(() => router.push('/'), 2000); 
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

        // Init answers
        const initialAnswers: Record<number, string | string[]> = {};
        sortedQuestions.forEach((q: Question) => {
          initialAnswers[q.id] = q.questionType === 2 ? [] : '';
        });
        setAnswers(initialAnswers);
      } catch (error: any) {
        console.error('Failed to fetch questions:', error);
        showAlert(error.message || '获取题目失败', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [searchParams, router]);

  const handleSubmit = async () => {
    const code = searchParams.get('code');
    if (!code) return;

    // Validate
    for (const question of questions) {
      if (question.isRequired === 1) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          showAlert(`请回答必答题目: ${question.questionText}`, 'error');
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
      showAlert('提交成功，即将跳转...', 'success');
      setTimeout(() => {
        router.push(`/verify?code=${code}`);
      }, 1500);
      
    } catch (error: any) {
      showAlert(error.message || '提交失败', 'error');
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
        <main
            className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500"/>
      </main>
    );
  }

  return (
      <main
          className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 pt-24 pb-10">
        <Navbar/>
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
            <CardHeader className="text-center pb-8 border-b border-gray-100 dark:border-gray-700/50">
              <CardTitle
                  className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600">
                白名单验证问卷
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                请认真回答以下问题以完成验证流程
            </CardDescription>
          </CardHeader>
            <CardContent className="space-y-8 pt-8">
              {questions.map((question, index) => (
                  <div
                      key={question.id}
                      className="space-y-4 p-6 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors duration-300"
                  >
                    <div className="flex items-start gap-3">
                  <span
                      className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    {index + 1}
                  </span>
                      <Label className="text-lg font-medium leading-relaxed pt-1">
                        {question.questionText}
                        {question.isRequired === 1 && <span className="text-red-500 ml-1" title="必答题">*</span>}
                      </Label>
                    </div>

                    <div className="pl-11">
                      {question.questionType === 1 && (
                          <RadioGroup
                              value={answers[question.id] as string}
                              onValueChange={(value) =>
                                  setAnswers({...answers, [question.id]: value})
                              }
                              className="space-y-3"
                          >
                            {question.whitelistQuizAnswerVoList?.map((option) => (
                                <div key={option.id}
                                     className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                     onClick={() => setAnswers({...answers, [question.id]: String(option.id)})}>
                                  <RadioGroupItem value={String(option.id)} id={`q${question.id}-${option.id}`}/>
                                  <Label htmlFor={`q${question.id}-${option.id}`}
                                         className="font-normal text-base cursor-pointer flex-1">
                                    {option.answerText}
                                  </Label>
                                </div>
                            ))}
                          </RadioGroup>
                      )}

                      {question.questionType === 2 && (
                          <div className="space-y-3">
                            {question.whitelistQuizAnswerVoList?.map((option) => (
                                <div key={option.id}
                                     className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                  <Checkbox
                                      id={`q${question.id}-${option.id}`}
                                      checked={(answers[question.id] as string[])?.includes(String(option.id))}
                                      onCheckedChange={(checked) =>
                                          handleCheckboxChange(question.id, String(option.id), checked as boolean)
                                      }
                                  />
                                  <Label htmlFor={`q${question.id}-${option.id}`}
                                         className="font-normal text-base cursor-pointer flex-1">
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
                                  setAnswers({...answers, [question.id]: e.target.value})
                              }
                              className="mt-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                          />
                      )}
                    </div>
              </div>
            ))}

              <div className="pt-6">
                <Button
                    size="lg"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="w-full h-12 text-lg font-medium bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all rounded-xl"
                >
                  {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                        正在提交...
                      </>
                  ) : '提交并继续'}
                </Button>
              </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {alertType === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-500"/>
              ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-500"/>
              )}
              {alertType === 'error' ? '提示' : '成功'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setAlertOpen(false);
            }}>
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
      <main
          className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500"/>
      </main>
    }>
      <QuizContent />
    </Suspense>
  );
}
