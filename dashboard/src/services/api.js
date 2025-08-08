import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const getLogs = () => axios.get(`${API_BASE}/log`);
