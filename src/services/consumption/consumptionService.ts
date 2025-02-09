import { api } from "../api/apiConfig";

export interface Consumption{
      userId: number;
      dishId: number;
      pantryId: number;
      quantity: number;
}

export async function insertConsumption(data: Consumption) {
    try {
      const response = await api.post('/consumption/insert', data);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        // Captura o atributo `log` do retorno do backend
        const errorMessage = error.response.data.log || 'Erro desconhecido ao registrar consumo.';
        console.error('Erro ao registrar consumo:', errorMessage);
        throw new Error(errorMessage);
      } else if (error.request) {
        // Caso o servidor não responda
        console.error('Nenhuma resposta do servidor:', error.request);
        throw new Error('O servidor não respondeu. Verifique sua conexão.');
      } else {
        // Outro tipo de erro inesperado
        console.error('Erro inesperado:', error.message);
        throw new Error('Erro inesperado ao registrar consumo.');
      }
    }
  }
  
  