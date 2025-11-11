import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Table, Badge, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as api from '../../services/api';
import PlayerForm from './PlayerForm';

export default function PlayerManagement() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [searchTerm, teamFilter, positionFilter]);

  const loadTeams = async () => {
    try {
      const data = await api.getAllTeams();
      setTeams(data);
    } catch (error) {
      toast.error('Error al cargar equipos');
    }
  };

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const data = await api.getAllPlayers(searchTerm, teamFilter, positionFilter);
      setPlayers(data);
    } catch (error) {
      toast.error('Error al cargar jugadores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlayer(null);
    setShowModal(true);
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setShowModal(true);
  };

  const handleDelete = async (playerId) => {
    try {
      await api.deletePlayer(playerId);
      toast.success('Jugador eliminado exitosamente');
      loadPlayers();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Error al eliminar jugador');
    }
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    loadPlayers();
  };

  const getPositionBadge = (position) => {
    const variants = {
      'Base': 'primary',
      'Escolta': 'info',
      'Alero': 'success',
      'Ala-Pívot': 'warning',
      'Pívot': 'danger'
    };
    return <Badge bg={variants[position] || 'secondary'}>{position || 'N/A'}</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Gestión de Jugadores</h1>
        <Button variant="primary" onClick={handleCreate}>
          + Agregar Jugador
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Buscar Jugador</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nombre del jugador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filtrar por Equipo</Form.Label>
                <Form.Select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
                  <option value="">Todos los equipos</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filtrar por Posición</Form.Label>
                <Form.Select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)}>
                  <option value="">Todas las posiciones</option>
                  <option value="Base">Base</option>
                  <option value="Escolta">Escolta</option>
                  <option value="Alero">Alero</option>
                  <option value="Ala-Pívot">Ala-Pívot</option>
                  <option value="Pívot">Pívot</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de jugadores */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <h3>No hay jugadores registrados</h3>
              <p>Crea tu primer jugador haciendo clic en "Agregar Jugador"</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Nombre Completo</th>
                  <th>Posición</th>
                  <th>Equipo</th>
                  <th>Altura</th>
                  <th>Edad</th>
                  <th>Nacionalidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td>
                      <Badge bg="dark" pill>#{player.number}</Badge>
                    </td>
                    <td className="fw-bold">{player.name}</td>
                    <td>{player.full_name || '-'}</td>
                    <td>{getPositionBadge(player.position)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        {player.team_logo && (
                          <img
                            src={player.team_logo}
                            alt={player.team_name}
                            style={{ width: 30, height: 30, objectFit: 'contain' }}
                            className="me-2"
                          />
                        )}
                        <div>
                          <div>{player.team_name}</div>
                          {player.team_city && (
                            <small className="text-muted">{player.team_city}</small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{player.height_cm ? `${player.height_cm} cm` : '-'}</td>
                    <td>{player.age || '-'}</td>
                    <td>{player.nationality || '-'}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(player)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setDeleteConfirm(player)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de formulario */}
      <PlayerForm
        show={showModal}
        onHide={() => setShowModal(false)}
        player={editingPlayer}
        teams={teams}
        onSuccess={handleFormSuccess}
      />

      {/* Modal de confirmación de eliminación */}
      <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar al jugador{' '}
          <strong>{deleteConfirm?.name}</strong> (#{deleteConfirm?.number})?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => handleDelete(deleteConfirm.id)}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
