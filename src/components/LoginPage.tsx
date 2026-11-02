import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Проверка, не залогинен ли уже пользователь
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/check-auth", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            // Если пользователь уже залогинен, редиректим на главную
            router.navigate({ to: "/" });
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, []);

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Registration successful!");
        // Очищаем форму после успешной регистрации
        setEmail("");
        setPassword("");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Internal server error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Сохраняем данные пользователя, включая статус superadmin
        localStorage.setItem('user', JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          oper_kod: data.user.oper_kod,
          superadmin: data.user.superadmin || false
        }));

        localStorage.setItem("accessToken", data.accessToken);

        toast.success(`Welcome to PartsFlow CRM${data.user.superadmin ? ' (Super Admin)' : ''}!`);

        setTimeout(() => {
          router.navigate({ to: data.redirectTo || "/homepage" });
        }, 50);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error('🔴 Login failed', error);
      toast.error("Internal server error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
    const action = submitter?.value || "login";

    if (action === "register") {
      await handleRegister();
    }

    if (action === "login") {
      await handleLogin();
    }
  };

  function getDate() {
    const today = new Date();

    const date = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');

    return `${month}/${date}/${year} ${hours}:${minutes}`;
  }

  function getDayOfWeek() {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return day;
  }

  const [currentDate, setCurrentDate] = useState(getDate());
  const [currentWeekDay, setCurrentWeekDay] = useState(getDayOfWeek());

  useEffect(() => {
    const date = getDate();
    setCurrentDate(date);
    const interval = setInterval(() => {
      setCurrentDate(getDate());
      setCurrentWeekDay(getDayOfWeek());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="login-page">
      <header className="login-header"><a href="/login" className="brand">partsflow<span>CRM</span></a><span className="text-sm text-gray-500">Sales, simply connected.</span></header>
      <main className="login-layout">
        <div className="login-intro">
          <p className="eyebrow">YOUR DAILY WORKSPACE</p>
          <h1>Less busywork.<br /><span>More connection.</span></h1>
          <p>Bring your customers, sales and team together in one calm, organized workspace.</p>
          <div className="login-features"><span>Customer relationships</span><span>Sales insights</span><span>Team planning</span></div>
          <p className="login-date">{currentWeekDay} · {currentDate}</p>
        </div>
        <div className="login-card">
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in to PartsFlow</h2>
          <p className="text-sm text-gray-500 mb-7">A little clarity for your working day.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-sm font-medium">Email address
              <input type="email" required autoComplete="email" placeholder="admin@partsflow.demo" value={email} onChange={(e)=>setEmail(e.target.value)} disabled={isLoading} className="login-input" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">Password
              <input type="password" required autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e)=>setPassword(e.target.value)} disabled={isLoading} className="login-input" />
            </label>
            <button type="submit" name="action" value="login" disabled={isLoading} className="login-submit">{isLoading ? "Signing in..." : "Sign in"}<span aria-hidden="true">→</span></button>
            <button type="submit" name="action" value="register" disabled={isLoading} className="text-sm text-violet-700 cursor-pointer">Create an account</button>
          </form>
          <div className="demo-access">
            <p className="text-xs text-gray-500 mb-3">EXPLORE THE DEMO · password: demo1234</p>
            <div className="flex gap-2">
              <button type="button" disabled={isLoading} onClick={()=>{setEmail("admin@partsflow.demo");setPassword("demo1234");}}>Administrator</button>
              <button type="button" disabled={isLoading} onClick={()=>{setEmail("m.anderson@partsflow.demo");setPassword("demo1234");}}>Sales representative</button>
            </div>
          </div>
        </div>
      </main>
      <footer className="login-footer"><span>© 2026 PartsFlow CRM</span><span>Automotive B2B · Interactive demo</span></footer>
    </section>
  );
}
