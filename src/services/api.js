// Configuración de la URL de la API
const API_URL = '/api';

// Helper para obtener el token
function getToken() {
  return localStorage.getItem('token');
}

// Helper para crear headers con autenticación
function getAuthHeaders() {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// Helper para manejar respuestas
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || error.message || 'Error en la petición');
  }
  return response.json();
}

// ========== AUTH API ==========

export async function login(username, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

export async function logout() {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
}

export async function getProfile() {
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    throw error;
  }
}

export async function changePassword(currentPassword, newPassword) {
  try {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    throw error;
  }
}

// TEAMS API

export async function getAllTeams(search = '', city = '') {
  try {
    let url = `${API_URL}/teams`;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (city) params.append('city', city);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    // Fallback a localStorage si falla la API
    const saved = localStorage.getItem('sb_teams');
    return saved ? JSON.parse(saved) : [];
  }
}

export async function getTeamById(teamId) {
  try {
    const response = await fetch(`${API_URL}/teams/${teamId}`, {
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    throw error;
  }
}

export async function createTeam(team) {
  try {
    const response = await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(team)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al crear equipo:', error);
    throw error;
  }
}

export async function updateTeam(teamId, team) {
  try {
    const response = await fetch(`${API_URL}/teams/${teamId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(team)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    throw error;
  }
}

export async function deleteTeam(teamId) {
  try {
    const response = await fetch(`${API_URL}/teams/${teamId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    throw error;
  }
}

export async function addPlayer(teamId, player) {
  try {
    const response = await fetch(`${API_URL}/teams/${teamId}/players`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(player)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al agregar jugador:', error);
    throw error;
  }
}

export async function updatePlayer(playerId, player) {
  try {
    const response = await fetch(`${API_URL}/teams/players/${playerId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(player)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar jugador:', error);
    throw error;
  }
}

export async function deletePlayer(playerId) {
  try {
    const response = await fetch(`${API_URL}/teams/players/${playerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al eliminar jugador:', error);
    throw error;
  }
}

export async function getAllPlayers(search = '', teamId = '', position = '') {
  try {
    let url = `${API_URL}/teams/players/all`;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (teamId) params.append('teamId', teamId);
    if (position) params.append('position', position);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener jugadores:', error);
    return [];
  }
}

export async function getPlayerById(playerId) {
  try {
    const response = await fetch(`${API_URL}/teams/players/${playerId}`, {
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener jugador:', error);
    throw error;
  }
}

// GAMES API

export async function saveGame(gameData) {
  try {
    const response = await fetch(`${API_URL}/games`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(gameData)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al guardar partido:', error);
    throw error;
  }
}

export async function getAllGames() {
  try {
    const response = await fetch(`${API_URL}/games`, {
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener partidos:', error);
    return [];
  }
}

export async function getGameById(gameId) {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}`, {
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener partido:', error);
    throw error;
  }
}

// ========== SCHEDULED GAMES API ==========

export async function getAllScheduledGames(filters = {}) {
  try {
    let url = `${API_URL}/scheduled-games`;
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.teamId) params.append('teamId', filters.teamId);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);

    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener partidos programados:', error);
    return [];
  }
}

export async function getScheduledGameById(gameId) {
  try {
    const response = await fetch(`${API_URL}/scheduled-games/${gameId}`, {
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener partido programado:', error);
    throw error;
  }
}

export async function createScheduledGame(gameData) {
  try {
    const response = await fetch(`${API_URL}/scheduled-games`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(gameData)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al crear partido programado:', error);
    throw error;
  }
}

export async function updateScheduledGame(gameId, gameData) {
  try {
    const response = await fetch(`${API_URL}/scheduled-games/${gameId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(gameData)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar partido programado:', error);
    throw error;
  }
}

export async function deleteScheduledGame(gameId) {
  try {
    const response = await fetch(`${API_URL}/scheduled-games/${gameId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al eliminar partido programado:', error);
    throw error;
  }
}

export async function updateGameStatus(gameId, status) {
  try {
    const response = await fetch(`${API_URL}/scheduled-games/${gameId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al actualizar estado del partido:', error);
    throw error;
  }
}
