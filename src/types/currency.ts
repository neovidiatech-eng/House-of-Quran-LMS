export interface Currency {
    id: string;
    name_en: string;
    name_ar: string;
    symbol: string;
    code: string;
    default?: boolean;
    createdAt: string;
    updatedAt: string;
    exchangeRate: number;
}

export interface CurrenciesData {
    count: number;
    default: Currency;
    currencies: Currency[];
}

export interface CurrenciesResponse {
    message: string;
    status: number;
    data: CurrenciesData;
}