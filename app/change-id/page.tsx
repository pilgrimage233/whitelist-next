'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
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
import {CheckCircle2, Edit, Loader2, Mail, User, XCircle} from 'lucide-react';
import type {ChangeIdRequest} from '@/lib/api';
import {changeWhitelistUserGameId, confirmChangeId, getWhitelistUserProfile, requestChangeId} from '@/lib/api';
import {Navbar} from '@/components/Navbar';

export default function ChangeIdPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: 填写信息, 2: 验证码, 3: 完成
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [loginToken, setLoginToken] = useState<string | null>(null);
  const [loginGameId, setLoginGameId] = useState<string | null>(null);

  const [requestForm, setRequestForm] = useState<ChangeIdRequest>({
    oldUserName: '',
    newUserName: '',
    qqNum: '',
    changeReason: '',
  });

  const [verifyCode, setVerifyCode] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('whitelistUserToken') : null;
    if (!token) {
      return;
    }
    setLoginToken(token);
    const cachedGameId = localStorage.getItem('whitelistUserGameId');
    if (cachedGameId) {
      setLoginGameId(cachedGameId);
    }
    getWhitelistUserProfile(token)
        .then((res) => {
          const gameId = res.data?.gameId || null;
          if (gameId) {
            localStorage.setItem('whitelistUserGameId', gameId);
            setLoginGameId(gameId);
          }
        })
        .catch(() => {
          // Ignore profile fetch failures here; fallback to cached values.
        });
  }, []);

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
      // Logic fix: Pass arguments separately as per API definition in backup
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
      oldUserName: loginGameId || '',
      newUserName: '',
      qqNum: '',
      changeReason: '',
    });
  };

  const handleDirectChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginToken) {
      showAlert('请先登录', 'error');
      return;
    }
    if (!requestForm.newUserName) {
      showAlert('请输入新的游戏ID', 'error');
      return;
    }
    if (!/^[a-zA-Z0-9_]{1,35}$/.test(requestForm.newUserName)) {
      showAlert('新游戏ID格式不正确', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await changeWhitelistUserGameId(loginToken, requestForm.newUserName, requestForm.changeReason);
      showAlert(res.msg || '游戏ID更改成功', 'success');
      localStorage.setItem('whitelistUserGameId', requestForm.newUserName);
      setLoginGameId(requestForm.newUserName);
      setStep(3);
    } catch (error: any) {
      showAlert(error.message || '更改失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setVerifyCode('');
    setCountdown(0);
  };

  const handleFinish = () => {
    router.push('/');
  };

  const isLoggedIn = Boolean(loginToken);

  return (
      <main
          className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 pt-24 pb-10">
        <Navbar/>

        <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600 inline-flex items-center gap-3">
              <Edit className="h-8 w-8 text-indigo-600"/>
              更改游戏ID
            </h1>
            <p className="text-muted-foreground mt-2">安全便捷地修改您的白名单ID</p>
          </div>

          <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md overflow-hidden">
            <CardHeader
                className="bg-gradient-to-r from-indigo-50/50 to-cyan-50/50 dark:from-indigo-900/10 dark:to-cyan-900/10 border-b border-gray-100 dark:border-gray-700/50 pb-6 pt-6">
              {/* 步骤条 */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                          step >= 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-200 text-gray-500'
                      }`}>
                    1
                  </div>
                  <span
                      className={`text-sm font-medium ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>信息</span>
                </div>
                <div
                    className={`w-12 h-1 mx-2 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}/>
                <div className="flex items-center gap-2">
                  <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                          step >= 2 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-200 text-gray-500'
                      }`}>
                    2
                  </div>
                  <span
                      className={`text-sm font-medium ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>验证</span>
                </div>
                <div
                    className={`w-12 h-1 mx-2 rounded-full transition-colors duration-300 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}/>
                <div className="flex items-center gap-2">
                  <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                          step >= 3 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-200 text-gray-500'
                      }`}>
                    3
                  </div>
                  <span
                      className={`text-sm font-medium ${step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>完成</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              {step === 1 && isLoggedIn && (
                  <form onSubmit={handleDirectChange}
                        className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm p-3">
                      已登录，可直接更改游戏ID，无需验证码。
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">当前游戏ID</Label>
                      <Input
                          value={loginGameId || '未绑定'}
                          disabled
                          className="bg-white/50 dark:bg-gray-900/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newUserName" className="text-sm font-medium">新游戏ID</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                        <Input
                            id="newUserName"
                            placeholder="请输入新的游戏ID"
                            value={requestForm.newUserName}
                            onChange={(e) => setRequestForm({...requestForm, newUserName: e.target.value})}
                            maxLength={35}
                            className="pl-9 bg-white/50 dark:bg-gray-900/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="changeReason" className="text-sm font-medium">更改原因（选填）</Label>
                      <Textarea
                          id="changeReason"
                          placeholder="请简要说明更改原因"
                          value={requestForm.changeReason}
                          onChange={(e) => setRequestForm({...requestForm, changeReason: e.target.value})}
                          maxLength={500}
                          className="min-h-[80px] resize-none bg-white/50 dark:bg-gray-900/50"
                      />
                    </div>

                    <div className="flex gap-4 pt-2">
                      <Button type="button" variant="ghost" onClick={handleReset} className="w-24">
                        重置
                      </Button>
                      <Button type="submit"
                              className="flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-md transition-all hover:shadow-lg"
                              disabled={loading}>
                        {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                              提交中...
                            </>
                        ) : (
                            '直接更改'
                        )}
                      </Button>
                    </div>
                  </form>
              )}

              {step === 1 && !isLoggedIn && (
                <form onSubmit={handleRequestChange}
                      className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="oldUserName" className="text-sm font-medium">旧游戏ID</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                    <Input
                        id="oldUserName"
                        placeholder="请输入当前的游戏ID"
                        value={requestForm.oldUserName}
                        onChange={(e) => setRequestForm({...requestForm, oldUserName: e.target.value})}
                        maxLength={35}
                        className="pl-9 bg-white/50 dark:bg-gray-900/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newUserName" className="text-sm font-medium">新游戏ID</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                    <Input
                        id="newUserName"
                        placeholder="请输入新的游戏ID"
                        value={requestForm.newUserName}
                        onChange={(e) => setRequestForm({...requestForm, newUserName: e.target.value})}
                        maxLength={35}
                        className="pl-9 bg-white/50 dark:bg-gray-900/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qqNum" className="text-sm font-medium">QQ号</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                    <Input
                        id="qqNum"
                        placeholder="请输入您的QQ号"
                        value={requestForm.qqNum}
                        onChange={(e) => setRequestForm({...requestForm, qqNum: e.target.value})}
                        maxLength={11}
                        className="pl-9 bg-white/50 dark:bg-gray-900/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="changeReason" className="text-sm font-medium">更改原因（选填）</Label>
                  <Textarea
                    id="changeReason"
                    placeholder="请简要说明更改原因"
                    value={requestForm.changeReason}
                    onChange={(e) => setRequestForm({ ...requestForm, changeReason: e.target.value })}
                    maxLength={500}
                    className="min-h-[80px] resize-none bg-white/50 dark:bg-gray-900/50"
                  />
                </div>

                  <div className="flex gap-4 pt-2">
                    <Button type="button" variant="ghost" onClick={handleReset} className="w-24">
                      重置
                    </Button>
                    <Button type="submit"
                            className="flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-md transition-all hover:shadow-lg"
                            disabled={loading}>
                    {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        发送中...
                        </>
                    ) : (
                        '获取验证码'
                    )}
                  </Button>
                </div>
              </form>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div
                      className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30 flex items-start gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-800/30 rounded-full">
                      <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400"/>
                    </div>
                    <div>
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-300">验证码已发送</h4>
                      <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 mt-1">
                        我们已向 <span className="font-mono font-medium">{requestForm.qqNum}@qq.com</span> 发送了验证码，请查收。
                      </p>
                  </div>
                </div>

                  <form onSubmit={handleConfirmChange} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-medium">输入验证码</Label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        placeholder="6位数字"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        maxLength={6}
                        className="text-center font-mono text-lg tracking-widest bg-white/50 dark:bg-gray-900/50 h-12"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResend}
                        disabled={countdown > 0 || loading}
                        className="h-12 min-w-[120px]"
                      >
                        {countdown > 0 ? `${countdown}s 后重发` : '重新发送'}
                      </Button>
                    </div>
                  </div>

                    <div className="flex gap-4 pt-2">
                      <Button type="button" variant="ghost" onClick={handleBack} className="w-24">
                        返回
                      </Button>
                      <Button type="submit"
                              className="flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-md transition-all hover:shadow-lg"
                              disabled={loading}>
                      {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                          确认中...
                          </>
                      ) : (
                        '确认更改'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
                <div className="py-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                  <div
                      className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 shadow-green-200 dark:shadow-green-900/20 shadow-lg">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400"/>
                </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    更改成功！
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">
                    您的游戏ID已成功更新，无需管理员审核，即刻生效。
                  </p>
                  <Button onClick={handleFinish}
                          className="w-full max-w-[200px] bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl">
                    返回首页
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {alertType === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {alertType === 'success' ? '操作成功' : '操作失败'}
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
