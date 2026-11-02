import { fetchWithAuth } from "../utils/fetchWithAuth";

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetchWithAuth(endpoint, options);
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`API error (${response.status}): ${errorText}`);
  }
  return response.json();
}
