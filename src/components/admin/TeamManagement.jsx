import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, InputGroup, Table, Badge, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as api from '../../services/api';
import TeamForm from './TeamForm';

export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await api.getAllTeams(search);
      setTeams(data);
    } catch (error) {
      toast.error('Error al cargar equipos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTeams();
  };

  const handleCreate = () => {
    setEditingTeam(null);
    setShowModal(true);
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setShowModal(true);
  };

  const handleDelete = async (teamId) => {
    try {
      await api.deleteTeam(teamId);
      toast.success('Equipo eliminado exitosamente');
      loadTeams();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Error al eliminar equipo');
    }
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    loadTeams();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Gestión de Equipos</h1>
        <Button variant="primary" onClick={handleCreate}>
          + Crear Equipo
        </Button>
      </div>

      {/* Búsqueda */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <InputGroup>
                <Form.Control
                  placeholder="Buscar por nombre o ciudad..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="outline-primary" onClick={handleSearch}>
                  Buscar
                </Button>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de equipos */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <h3>No hay equipos registrados</h3>
              <p>Crea tu primer equipo haciendo clic en el botón "Crear Equipo"</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Nombre</th>
                  <th>Ciudad</th>
                  <th>Año Fundación</th>
                  <th>Jugadores</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id}>
                    <td>
                      {team.logo ? (
                        <img
                          src={team.logo}
                          alt={team.name}
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: '#ddd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          🏀
                        </div>
                      )}
                    </td>
                    <td className="fw-bold">{team.name}</td>
                    <td>{team.city || '-'}</td>
                    <td>{team.founded_year || '-'}</td>
                    <td>
                      <Badge bg="secondary">{team.players?.length || 0} jugadores</Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(team)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setDeleteConfirm(team)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de formulario */}
      <TeamForm
        show={showModal}
        onHide={() => setShowModal(false)}
        team={editingTeam}
        onSuccess={handleFormSuccess}
      />

      {/* Modal de confirmación de eliminación */}
      <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar el equipo <strong>{deleteConfirm?.name}</strong>?
          <br />
          <small className="text-danger">Esta acción también eliminará todos los jugadores asociados.</small>
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
