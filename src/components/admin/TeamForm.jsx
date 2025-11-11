import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import * as api from '../../services/api';

const schema = yup.object({
  name: yup.string().required('El nombre es requerido').min(3, 'Mínimo 3 caracteres'),
  city: yup.string(),
  founded_year: yup.number().min(1800, 'Año inválido').max(new Date().getFullYear(), 'Año inválido')
}).required();

export default function TeamForm({ show, onHide, team, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        city: team.city || '',
        founded_year: team.founded_year || ''
      });
      setLogoPreview(team.logo);
    } else {
      reset({
        name: '',
        city: '',
        founded_year: ''
      });
      setLogoPreview(null);
    }
  }, [team, reset]);

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const teamData = {
        ...data,
        logo: logoPreview
      };

      if (team) {
        // Editar
        await api.updateTeam(team.id, teamData);
        toast.success('Equipo actualizado exitosamente');
      } else {
        // Crear
        const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        await api.createTeam({ id, ...teamData });
        toast.success('Equipo creado exitosamente');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Error al guardar equipo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{team ? 'Editar Equipo' : 'Crear Equipo'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Equipo *</Form.Label>
                <Form.Control
                  {...register('name')}
                  isInvalid={!!errors.name}
                  placeholder="Ej: Lakers"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ciudad</Form.Label>
                <Form.Control
                  {...register('city')}
                  placeholder="Ej: Los Ángeles"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Año de Fundación</Form.Label>
                <Form.Control
                  type="number"
                  {...register('founded_year')}
                  isInvalid={!!errors.founded_year}
                  placeholder="Ej: 2020"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.founded_year?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Logo del Equipo</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </Form.Group>
            </Col>

            {logoPreview && (
              <Col md={12} className="text-center mb-3">
                <img
                  src={logoPreview}
                  alt="Preview"
                  style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '50%' }}
                />
              </Col>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : team ? 'Actualizar' : 'Crear'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
