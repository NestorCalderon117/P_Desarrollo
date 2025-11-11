import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import * as api from '../../services/api';

const schema = yup.object({
  teamA_id: yup.string().required('Selecciona el equipo local'),
  teamB_id: yup.string().required('Selecciona el equipo visitante'),
  scheduled_date: yup.date().required('La fecha es requerida'),
  location: yup.string()
}).required();

export default function GameForm({ show, onHide, game, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);
  const [selectedRoster, setSelectedRoster] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(schema)
  });

  const teamA_id = watch('teamA_id');
  const teamB_id = watch('teamB_id');

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (game) {
      const date = new Date(game.scheduled_date);
      const formattedDate = date.toISOString().slice(0, 16);

      reset({
        teamA_id: game.teamA_id,
        teamB_id: game.teamB_id,
        scheduled_date: formattedDate,
        location: game.location || ''
      });

      setSelectedRoster(game.roster || []);
    } else {
      reset({
        teamA_id: '',
        teamB_id: '',
        scheduled_date: '',
        location: ''
      });
      setSelectedRoster([]);
    }
  }, [game, reset]);

  // Cargar jugadores cuando se selecciona un equipo
  useEffect(() => {
    if (teamA_id) {
      loadTeamPlayers(teamA_id, 'A');
    } else {
      setTeamAPlayers([]);
    }
  }, [teamA_id]);

  useEffect(() => {
    if (teamB_id) {
      loadTeamPlayers(teamB_id, 'B');
    } else {
      setTeamBPlayers([]);
    }
  }, [teamB_id]);

  const loadTeams = async () => {
    try {
      const data = await api.getAllTeams();
      setTeams(data);
    } catch (error) {
      toast.error('Error al cargar equipos');
    }
  };

  const loadTeamPlayers = async (teamId, team) => {
    try {
      const teamData = await api.getTeamById(teamId);
      if (team === 'A') {
        setTeamAPlayers(teamData.players || []);
      } else {
        setTeamBPlayers(teamData.players || []);
      }
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
    }
  };

  const togglePlayerInRoster = (player, team) => {
    const playerId = player.id;
    const isInRoster = selectedRoster.some(p => p.player_id === playerId);

    if (isInRoster) {
      setSelectedRoster(selectedRoster.filter(p => p.player_id !== playerId));
    } else {
      setSelectedRoster([...selectedRoster, { player_id: playerId, team, ...player }]);
    }
  };

  const isPlayerInRoster = (playerId) => {
    return selectedRoster.some(p => p.player_id === playerId);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const teamA = teams.find(t => t.id === data.teamA_id);
      const teamB = teams.find(t => t.id === data.teamB_id);

      const gameData = {
        teamA_id: data.teamA_id,
        teamA_name: teamA?.name || '',
        teamB_id: data.teamB_id,
        teamB_name: teamB?.name || '',
        scheduled_date: data.scheduled_date,
        location: data.location,
        roster: selectedRoster.map(p => ({
          player_id: p.player_id || p.id,
          team: p.team
        }))
      };

      if (game) {
        // Editar
        await api.updateScheduledGame(game.id, { ...gameData, status: game.status });
        toast.success('Partido actualizado exitosamente');
      } else {
        // Crear
        await api.createScheduledGame(gameData);
        toast.success('Partido programado exitosamente');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Error al guardar partido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>{game ? 'Editar Partido' : 'Programar Partido'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Equipo Local *</Form.Label>
                <Form.Select
                  {...register('teamA_id')}
                  isInvalid={!!errors.teamA_id}
                >
                  <option value="">Selecciona equipo...</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.teamA_id?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Equipo Visitante *</Form.Label>
                <Form.Select
                  {...register('teamB_id')}
                  isInvalid={!!errors.teamB_id}
                >
                  <option value="">Selecciona equipo...</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.teamB_id?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha y Hora *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  {...register('scheduled_date')}
                  isInvalid={!!errors.scheduled_date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.scheduled_date?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ubicación</Form.Label>
                <Form.Control
                  {...register('location')}
                  placeholder="Ej: Estadio Nacional"
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />

          <h5 className="mb-3">Selección de Roster</h5>
          <Row>
            <Col md={6}>
              <h6 className="text-primary">
                {teams.find(t => t.id === teamA_id)?.name || 'Equipo Local'}
              </h6>
              <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {teamAPlayers.length === 0 ? (
                  <ListGroup.Item className="text-muted text-center">
                    {teamA_id ? 'Sin jugadores' : 'Selecciona un equipo'}
                  </ListGroup.Item>
                ) : (
                  teamAPlayers.map(player => (
                    <ListGroup.Item
                      key={player.id}
                      action
                      active={isPlayerInRoster(player.id)}
                      onClick={() => togglePlayerInRoster(player, 'A')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span>
                          <Badge bg="secondary" className="me-2">#{player.number}</Badge>
                          {player.name}
                        </span>
                        {player.position && <small className="text-muted">{player.position}</small>}
                      </div>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Col>

            <Col md={6}>
              <h6 className="text-success">
                {teams.find(t => t.id === teamB_id)?.name || 'Equipo Visitante'}
              </h6>
              <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {teamBPlayers.length === 0 ? (
                  <ListGroup.Item className="text-muted text-center">
                    {teamB_id ? 'Sin jugadores' : 'Selecciona un equipo'}
                  </ListGroup.Item>
                ) : (
                  teamBPlayers.map(player => (
                    <ListGroup.Item
                      key={player.id}
                      action
                      active={isPlayerInRoster(player.id)}
                      onClick={() => togglePlayerInRoster(player, 'B')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span>
                          <Badge bg="secondary" className="me-2">#{player.number}</Badge>
                          {player.name}
                        </span>
                        {player.position && <small className="text-muted">{player.position}</small>}
                      </div>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Col>
          </Row>

          <div className="mt-3">
            <Badge bg="info">
              {selectedRoster.length} jugadores seleccionados para el roster
            </Badge>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : game ? 'Actualizar' : 'Programar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
