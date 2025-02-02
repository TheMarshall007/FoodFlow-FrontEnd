import { api } from '../api/apiConfig';

interface LoginData {
  username: string;
  password: string;
  reminder?: boolean;
}

// Função de login que chama o endpoint `/auth/login`
export async function postLogin(data: LoginData) {
  const { username, password, reminder } = data;

  try {
    const response = await api.post('/auth/login', { username, password });

    // Verifica se o login foi bem-sucedido e armazena o token
    if (response.status === 200 && response.data.token) {
      if (reminder) {
        await rememberMe(username, password);
      }
      return response;
    } else {
      throw new Error('Erro ao tentar fazer o login!');
    }
  } catch (error) {
    console.error(error);
    alert('Usuário e/ou senha incorretos!');
    return { success: false };
  }
}

// Função auxiliar para salvar as credenciais se o usuário ativou "lembrar-me"
async function rememberMe(username: string, password: string) {
  try {
    const response = await api.post('/refresh-token', { password });
    const refreshToken = response.data?.token;

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('lastEmail', username);
    }
  } catch (error) {
    console.error('Erro ao salvar o token de atualização:', error);
  }
}
