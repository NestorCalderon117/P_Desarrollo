import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import * as api from '../../services/api';

const schema = yup.object({
  team_id: yup.string().required('Selecciona un equipo'),
  name: yup.string().required('El nombre es requerido').min(2, 'Mínimo 2 caracteres'),
  full_name: yup.string(),
  number: yup.string().required('El número es requerido'),
  position: yup.string(),
  height_cm: yup.number().positive('Debe ser un número positivo').integer('Debe ser un número entero'),
  age: yup.number().positive('Debe ser un número positivo').integer('Debe ser un número entero').max(99, 'Edad máxima 99'),
  nationality: yup.string()
}).required();

export default function PlayerForm({ show, onHide, player, teams, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (player) {
      reset({
        team_id: player.team_id,
        name: player.name,
        full_name: player.full_name || '',
        number: player.number,
        position: player.position || '',
        height_cm: player.height_cm || '',
        age: player.age || '',
        nationality: player.nationality || ''
      });
    } else {
      reset({
        team_id: '',
        name: '',
        full_name: '',
        number: '',
        position: '',
        height_cm: '',
        age: '',
        nationality: ''
      });
    }
  }, [player, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Generar ID único para jugador nuevo
      const playerId = player?.id || `player_${Date.now()}`;

      const playerData = {
        id: playerId,
        name: data.name,
        full_name: data.full_name || null,
        number: data.number,
        position: data.position || null,
        height_cm: data.height_cm ? parseInt(data.height_cm) : null,
        age: data.age ? parseInt(data.age) : null,
        nationality: data.nationality || null
      };

      if (player) {
        // Editar jugador existente
        await api.updatePlayer(player.id, playerData);
        toast.success('Jugador actualizado exitosamente');
      } else {
        // Crear nuevo jugador
        await api.addPlayer(data.team_id, playerData);
        toast.success('Jugador creado exitosamente');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Error al guardar jugador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{player ? 'Editar Jugador' : 'Nuevo Jugador'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Equipo *</Form.Label>
                <Form.Select
                  {...register('team_id')}
                  isInvalid={!!errors.team_id}
                  disabled={!!player}
                >
                  <option value="">Selecciona un equipo...</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.team_id?.message}
                </Form.Control.Feedback>
                {player && (
                  <Form.Text className="text-muted">
                    No se puede cambiar el equipo al editar
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Número de Camiseta *</Form.Label>
                <Form.Control
                  type="text"
                  {...register('number')}
                  isInvalid={!!errors.number}
                  placeholder="Ej: 23"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.number?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  {...register('name')}
                  isInvalid={!!errors.name}
                  placeholder="Ej: M. Jordan"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre Completo</Form.Label>
                <Form.Control
                  type="text"
                  {...register('full_name')}
                  placeholder="Ej: Michael Jeffrey Jordan"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Posición</Form.Label>
                <Form.Select {...register('position')}>
                  <option value="">Selecciona posición...</option>
                  <option value="Base">Base</option>
                  <option value="Escolta">Escolta</option>
                  <option value="Alero">Alero</option>
                  <option value="Ala-Pívot">Ala-Pívot</option>
                  <option value="Pívot">Pívot</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Altura (cm)</Form.Label>
                <Form.Control
                  type="number"
                  {...register('height_cm')}
                  isInvalid={!!errors.height_cm}
                  placeholder="Ej: 198"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.height_cm?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Edad</Form.Label>
                <Form.Control
                  type="number"
                  {...register('age')}
                  isInvalid={!!errors.age}
                  placeholder="Ej: 28"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.age?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nacionalidad</Form.Label>
                <Form.Control
                  type="text"
                  {...register('nationality')}
                  placeholder="Ej: Estados Unidos"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : player ? 'Actualizar' : 'Crear'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
