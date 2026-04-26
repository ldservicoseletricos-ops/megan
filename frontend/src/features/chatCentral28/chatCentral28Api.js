const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || 'Falha ao conectar com o Chat Central 28.0');
  }
  return data;
}

export async function getChatCentral28Status() {
  const response = await fetch(`${API_URL}/api/chat-central-28/status`);
  return parseResponse(response);
}

export async function sendChatCentral28Message(message) {
  const response = await fetch(`${API_URL}/api/chat-central-28/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return parseResponse(response);
}
