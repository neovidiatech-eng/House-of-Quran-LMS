import api from "../../../lib/axios";
import { CurrenciesData, Currency } from "../../../types/currency";

export const getCurrencies = async (): Promise<CurrenciesData> => {
    const response = await api.get("/transactions/currency/currencies");
    const data = response.data.data;
    return data;
};

export const getCurrencyById = async (id: string): Promise<Currency> => {
    const response = await api.get(`/transactions/currency/${id}`);
    return response.data.data;
}

export const searchCurrency = async (search: string): Promise<CurrenciesData> => {
    try {
        const response = await api.get(`/transactions/currency/currencies?search=${search}`);
        const data = response.data.data;

        if (Array.isArray(data)) {
            return {
                currencies: data,
                count: data.length,
                default: data.find(c => c.default) || data[0]
            };
        }

        return data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return {
                currencies: [],
                count: 0,
                default: {} as Currency
            };
        }
        throw error;
    }
}

export const addCurrency = async (data: Omit<Currency, 'id' | 'createdAt' | 'updatedAt'>) => {
    const cleanData = { ...data };
    delete cleanData.default;
    const response = await api.post('/transactions/currency/add-currency', cleanData);
    return response.data;
}

export const updateCurrency = async (id: string, data: Partial<Currency>) => {
    const response = await api.patch(`/transactions/currency/update-currency/${id}`, data);
    return response.data;
}

export const deleteCurrency = async (id: string) => {
    const response = await api.delete(`/transactions/currency/delete-currency/${id}`);
    return response.data;
}