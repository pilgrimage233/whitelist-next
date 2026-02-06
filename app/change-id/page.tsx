'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {ArrowLeft, CheckCircle2, Edit, Mail, RefreshCw, XCircle} from 'lucide-react';
import type {ChangeIdRequest} from '@/lib/api';
import {confirmChangeId, requestChangeId} from '@/lib/api';
import {Navbar} from '@/components/Navbar';

export default function ChangeIdPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: 填写信息, 2: 验证码, 3: 完成
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  const [requestForm, setRequestForm] = useState<ChangeIdRequest>({
    oldUserName: '',
    newUserName: '',
    qqNum: '',
    changeReason: '',
  });

  const [verifyCode, setVerifyCode] = useState('');

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertOpen(true);
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestForm.oldUserName || !requestForm.newUserName || !requestForm.qqNum) {
      showAlert('请填写完整信息', 'error');
      return;
    }

    if (!/^[a-zA-Z0-9_]{1,35}$/.test(requestForm.oldUserName)) {
      showAlert('旧游戏ID格式不正确', 'error');
      return;
    }

    if (!/^[a-zA-Z0-9_]{1,35}$/.test(requestForm.newUserName)) {
      showAlert('新游戏ID格式不正确', 'error');
      return;
    }

    if (!/^\d{5,11}$/.test(requestForm.qqNum)) {
      showAlert('QQ号格式错误', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await requestChangeId(requestForm);
      showAlert(res.msg || '验证码已发送，请查收邮件', 'success');
      setStep(2);
      startCountdown();
    } catch (error: any) {
      showAlert(error.message || '请求失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verifyCode) {
      showAlert('请输入验证码', 'error');
      return;
    }

    if (!/^\d{6}$/.test(verifyCode)) {
      showAlert('验证码为6位数字', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await confirmChangeId(verifyCode, requestForm.qqNum);
      showAlert(res.msg || '游戏ID更改成功', 'success');
      setStep(3);
    } catch (error: any) {
      showAlert(error.message || '确认失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await requestChangeId(requestForm);
      showAlert(res.msg || '验证码已重新发送', 'success');
      startCountdown();
    } catch (error: any) {
      showAlert(error.message || '发送失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRequestForm({
      oldUserName: '',
      newUserName: '',
      qqNum: '',
      changeReason: '',
    });
  };

  const handleBack = () => {
    setStep(1);
    setVerifyCode('');
    setCountdown(0);
  };

  const handleFinish = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen animated-gradient p-4 pt-20">
      <Navbar
          rightButtons={
            <Button variant="outline" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4"/>
              返回
            </Button>
          }
      />
      <div className="max-w-2xl mx-auto">
        <Card className="hover-lift shadow-lg fade-in">
          <CardHeader>
            <CardTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
              <Edit className="h-6 w-6"/>
              更改白名单游戏ID
            </CardTitle>
            <CardDescription className="mt-2">
              通过邮箱验证安全地更改您的游戏ID
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* 步骤指示器 */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-500' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}>
                    1
                  </div>
                  <span className="text-sm font-medium">填写信息</span>
                </div>
                <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-500' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}>
                    2
                  </div>
                  <span className="text-sm font-medium">邮箱验证</span>
                </div>
                <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-500' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}>
                    3
                  </div>
                  <span className="text-sm font-medium">完成</span>
                </div>
              </div>
            </div>

            {/* 步骤1：填写信息 */}
            {step === 1 && (
              <form onSubmit={handleRequestChange} className="space-y-5 slide-in">
                <div className="space-y-2">
                  <Label htmlFor="oldUserName" className="text-sm font-semibold">旧游戏ID</Label>
                  <Input
                    id="oldUserName"
                    placeholder="请输入当前的游戏ID"
                    value={requestForm.oldUserName}
                    onChange={(e) => setRequestForm({ ...requestForm, oldUserName: e.target.value })}
                    maxLength={35}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newUserName" className="text-sm font-semibold">新游戏ID</Label>
                  <Input
                    id="newUserName"
                    placeholder="请输入新的游戏ID"
                    value={requestForm.newUserName}
                    onChange={(e) => setRequestForm({ ...requestForm, newUserName: e.target.value })}
                    maxLength={35}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qqNum" className="text-sm font-semibold">QQ号</Label>
                  <Input
                    id="qqNum"
                    placeholder="请输入您的QQ号"
                    value={requestForm.qqNum}
                    onChange={(e) => setRequestForm({ ...requestForm, qqNum: e.target.value })}
                    maxLength={11}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="changeReason" className="text-sm font-semibold">更改原因（选填）</Label>
                  <Textarea
                    id="changeReason"
                    placeholder="请简要说明更改原因"
                    value={requestForm.changeReason}
                    onChange={(e) => setRequestForm({ ...requestForm, changeReason: e.target.value })}
                    maxLength={500}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1 h-11" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        发送中...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        发送验证码
                      </span>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="h-11">
                    重置
                  </Button>
                </div>
              </form>
            )}

            {/* 步骤2：邮箱验证 */}
            {step === 2 && (
              <div className="space-y-5 slide-in">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-700 dark:text-blue-400">验证码已发送</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        验证码已发送到您的QQ邮箱：{requestForm.qqNum}@qq.com
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        请在30分钟内完成验证
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleConfirmChange} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-semibold">验证码</Label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        placeholder="请输入6位数字验证码"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        maxLength={6}
                        className="h-11 flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResend}
                        disabled={countdown > 0 || loading}
                        className="h-11 min-w-[120px]"
                      >
                        {countdown > 0 ? `${countdown}秒后重发` : '重新发送'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1 h-11" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          确认中...
                        </span>
                      ) : (
                        '确认更改'
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleBack} className="h-11">
                      返回
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* 步骤3：完成 */}
            {step === 3 && (
              <div className="text-center py-12 space-y-6 fade-in">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    更改成功
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    您的游戏ID已成功更改
                  </p>
                </div>
                <Button onClick={handleFinish} size="lg">
                  完成
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {alertType === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {alertType === 'success' ? '成功' : '错误'}
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
