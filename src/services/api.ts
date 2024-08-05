import axios from 'axios';

const api = axios.create({
  baseURL: 'https://artisan-staking-backend.herokuapp.com/'
});

export { api };
