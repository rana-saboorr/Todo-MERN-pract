import axios from "axios"; // http  client library to fetch and send data 
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,   /* it tells that it includes cookies, http auth etc */
});

export default api;