import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

async function test() {
  try {
    const res = await api.get('/teams/lookup/252921002');
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data || err.message);
  }
}

test();
