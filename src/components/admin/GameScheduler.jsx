import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Table, Badge, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as api from '../../services/api';
import GameForm from './GameForm';

export default function GameScheduler() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadGames();
  }, [statusFilter]);

  const loadGames = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter) filters.status = statusFilter;

      const data = await api.getAllScheduledGames(filters);
      setGames(data);
    } catch (error) {
      toast.error('Error al cargar partidos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingGame(null);
    setShowModal(true);
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setShowModal(true);
  };

  const handleDelete = async (gameId) => {
    try {
      await api.deleteScheduledGame(gameId);
      toast.success('Partido eliminado exitosamente');
      loadGames();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Error al eliminar partido');
    }
  };

  const handleStatusChange = async (gameId, newStatus) => {
    try {
      await api.updateGameStatus(gameId, newStatus);
      toast.success('Estado actualizado');
      loadGames();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    loadGames();
  };

  const getStatusBadge = (status) => {
    const variants = {
      scheduled: 'primary',
      in_progress: 'warning',
      completed: 'success',
      cancelled: 'danger'
    };
    const labels = {
      scheduled: 'Programado',
      in_progress: 'En Progreso',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return <Badge bg={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Gestión de Partidos</h1>
        <Button variant="primary" onClick={handleCreate}>
          + Programar Partido
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filtrar por Estado</Form.Label>
                <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="scheduled">Programados</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="completed">Completados</option>
                  <option value="cancelled">Cancelados</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de partidos */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <h3>No hay partidos programados</h3>
              <p>Crea tu primer partido haciendo clic en "Programar Partido"</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Equipo Local</th>
                  <th>Equipo Visitante</th>
                  <th>Ubicación</th>
                  <th>Roster</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id}>
                    <td className="fw-bold">{formatDate(game.scheduled_date)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="me-2">🏠</span>
                        {game.teamA_name}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="me-2">✈️</span>
                        {game.teamB_name}
                      </div>
                    </td>
                    <td>{game.location || '-'}</td>
                    <td>
                      <Badge bg="info">{game.roster?.length || 0} jugadores</Badge>
                    </td>
                    <td>{getStatusBadge(game.status)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        {game.status === 'scheduled' && (
                          <>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(game)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleStatusChange(game.id, 'in_progress')}
                            >
                              Iniciar
                            </Button>
                          </>
                        )}
                        {game.status === 'in_progress' && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleStatusChange(game.id, 'completed')}
                          >
                            Finalizar
                          </Button>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setDeleteConfirm(game)}
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
      <GameForm
        show={showModal}
        onHide={() => setShowModal(false)}
        game={editingGame}
        onSuccess={handleFormSuccess}
      />

      {/* Modal de confirmación de eliminación */}
      <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar el partido entre{' '}
          <strong>{deleteConfirm?.teamA_name}</strong> vs{' '}
          <strong>{deleteConfirm?.teamB_name}</strong>?
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
