
import axios from "axios";

const BASE_URL = "https://hook.eu2.make.com/4mphvkvewkhsrcyqf4muks1hbwctxxjr";


export const standardFetch = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    headers: {
        "Content-Type": "application/json"
    }
});