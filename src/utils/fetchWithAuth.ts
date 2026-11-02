export async function fetchWithAuth(url: string, options: any = {}) {
  const token = localStorage.getItem("accessToken");

  // добавляем access токен
  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  let response = await fetch(url, {
    ...options,
    credentials: "include", // важно для refresh cookie
  });


  
  // если сервер прислал новый accessToken → обновить
  const newAccessToken = response.headers.get("x-access-token");
  if (newAccessToken) {
    localStorage.setItem("accessToken", newAccessToken);
  }

  // если access токен истёк → делаем авто-refresh
  if (response.status === 401 || response.status === 403) {
    window.location.href = "/login";

    console.warn("⚠ Токен истёк → пробуем авто-refresh");

    // пробуем refresh
    const refreshRes = await fetch("/api/refresh", {
      method: "GET",
      credentials: "include",
    });

    if (!refreshRes.ok) {
      console.error("❌ Refresh провалился → redirect to login");
      localStorage.removeItem("accessToken");
      return response; // можно обработать на фронте (logout)
    }

    const refreshData = await refreshRes.json();

    // сервер вернул новый accessToken
    if (refreshData.accessToken) {
      localStorage.setItem("accessToken", refreshData.accessToken);
    }

    // повторяем запрос с новым токеном
    options.headers.Authorization = `Bearer ${refreshData.accessToken}`;
    response = await fetch(url, {
      ...options,
      credentials: "include",
    });
  }

  return response;
}
