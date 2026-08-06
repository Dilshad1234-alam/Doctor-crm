export async function fetchJson(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `/api${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}
