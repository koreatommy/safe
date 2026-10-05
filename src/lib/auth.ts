const SESSION_ENDPOINT = "/api/admin/session";

/** 비밀번호는 서버에서만 확인하고, 세션은 httpOnly 쿠키로 유지된다. */
export async function login(password: string): Promise<boolean> {
  try {
    const res = await fetch(SESSION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  await fetch(SESSION_ENDPOINT, { method: "DELETE" }).catch(() => undefined);
}
