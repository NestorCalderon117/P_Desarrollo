import React from 'react';
import { Container, Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid className="px-4">
          <Navbar.Brand as={Link} to="/admin" className="fw-bold">
            🏀 Basketball Admin
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/admin/teams">Equipos</Nav.Link>
              <Nav.Link as={Link} to="/admin/players">Jugadores</Nav.Link>
              <Nav.Link as={Link} to="/admin/games">Partidos</Nav.Link>
              <Nav.Link as={Link} to="/scoreboard">Marcador en Vivo</Nav.Link>
            </Nav>
            <Nav>
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-light" id="dropdown-user">
                  {user?.username}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item disabled>
                    <small className="text-muted">Rol: {user?.role}</small>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/admin/profile">
                    Mi Perfil
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Content */}
      <Container fluid className="px-4 py-4">
        <Outlet />
      </Container>
    </div>
  );
}
