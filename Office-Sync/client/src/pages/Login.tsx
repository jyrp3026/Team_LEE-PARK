import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import api from '@/lib/api';

interface LoginFormData {
  username: string;
  password: string;
}

interface SignupFormData extends LoginFormData {
  confirmPassword: string;
  email: string;
}

export default function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [adminLogin, setAdminLogin] = useState<LoginFormData>({ username: '', password: '' });
  const [userLogin, setUserLogin] = useState<LoginFormData>({ username: '', password: '' });
  const [signup, setSignup] = useState<SignupFormData>({ username: '', email: '', password: '', confirmPassword: '' });
  const [activeTab, setActiveTab] = useState('admin-login');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminLogin.username || !adminLogin.password) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/login/', adminLogin);
      if (!res.data.user.is_staff) {
        toast.error('관리자 계정이 아닙니다');
        return;
      }
      localStorage.setItem('currentUser', JSON.stringify({
        token: res.data.token,
        username: res.data.user.username,
        role: 'admin',
      }));
      toast.success('관리자 로그인 성공!');
      onLoginSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userLogin.username || !userLogin.password) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/login/', userLogin);
      if (res.data.user.is_staff) {
        toast.error('관리자 계정은 관리자 탭에서 로그인해주세요');
        return;
      }
      localStorage.setItem('currentUser', JSON.stringify({
        token: res.data.token,
        username: res.data.user.username,
        role: 'user',
      }));
      toast.success('로그인 성공!');
      onLoginSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || '아이디 또는 비밀번호가 틀렸습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signup.username || !signup.email || !signup.password || !signup.confirmPassword) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }

    if (signup.password !== signup.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다');
      return;
    }

    if (signup.password.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/signup/', {
        username: signup.username,
        email: signup.email,
        password: signup.password,
      });
      toast.success('회원가입 성공! 로그인해주세요');
      setSignup({ username: '', email: '', password: '', confirmPassword: '' });
      setActiveTab('user-login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || '회원가입에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Office-Sync</h1>
          <p className="text-center text-gray-600 mb-6">비품/도서 관리 시스템</p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="admin-login">관리자</TabsTrigger>
              <TabsTrigger value="user-login">사용자</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>

            {/* 관리자 로그인 */}
            <TabsContent value="admin-login" className="space-y-4">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">관리자 아이디</label>
                  <Input
                    type="text"
                    placeholder="admin"
                    value={adminLogin.username}
                    onChange={(e) => setAdminLogin({ ...adminLogin, username: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">비밀번호</label>
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={adminLogin.password}
                    onChange={(e) => setAdminLogin({ ...adminLogin, password: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {isLoading ? '로그인 중...' : '관리자 로그인'}
                </Button>
              </form>
            </TabsContent>

            {/* 사용자 로그인 */}
            <TabsContent value="user-login" className="space-y-4">
              <form onSubmit={handleUserLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">사용자명</label>
                  <Input
                    type="text"
                    placeholder="username"
                    value={userLogin.username}
                    onChange={(e) => setUserLogin({ ...userLogin, username: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">비밀번호</label>
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={userLogin.password}
                    onChange={(e) => setUserLogin({ ...userLogin, password: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
                  {isLoading ? '로그인 중...' : '로그인'}
                </Button>
              </form>
            </TabsContent>

            {/* 회원가입 */}
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">사용자명</label>
                  <Input
                    type="text"
                    placeholder="username"
                    value={signup.username}
                    onChange={(e) => setSignup({ ...signup, username: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">이메일</label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={signup.email}
                    onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">비밀번호</label>
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={signup.password}
                    onChange={(e) => setSignup({ ...signup, password: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">비밀번호 확인</label>
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={signup.confirmPassword}
                    onChange={(e) => setSignup({ ...signup, confirmPassword: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700">
                  {isLoading ? '처리 중...' : '회원가입'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
