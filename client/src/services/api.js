import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const getSquad = (teamId, gw) =>
  api.get(`/fpl/squad/${teamId}?gw=${gw}`);

export const getFixtures = () =>
  api.get('/fixtures');

export const getBootstrap = () =>
  api.get('/fpl/bootstrap');

export const getHistory = (token) =>
  api.get('/ai/history', {
    headers: { Authorization: `Bearer ${token}` }
  });