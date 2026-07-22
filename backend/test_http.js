import axios from 'axios';

async function testHttp() {
  try {
    const adminRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'kshirsagaraditya9112@gmail.com',
      password: 'Aditya9112@@'
    });
    console.log('Admin HTTP Login:', adminRes.status, adminRes.data.message);
  } catch (err) {
    console.error('Admin HTTP Error:', err.response?.status, err.response?.data);
  }

  try {
    const studentRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      prn: '252921001@sguk.ac.in'
    });
    console.log('Student HTTP Login:', studentRes.status, studentRes.data.message);
  } catch (err) {
    console.error('Student HTTP Error:', err.response?.status, err.response?.data);
  }
}

testHttp();
