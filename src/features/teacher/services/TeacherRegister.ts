import axios from "axios"

export const fetchCitiesByCountry =

    async (countryCode: string) => {
        const response = await axios.get(`https://countries.dev/cities?country=${countryCode}`);
        return response.data;
    } 
