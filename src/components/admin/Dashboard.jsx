import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const cards = [
    {
      title: 'Equipos',
      icon: '👥',
      description: 'Gestionar equipos y sus datos',
      link: '/admin/teams',
      color: '#667eea'
    },
    {
      title: 'Jugadores',
      icon: '⛹️',
      description: 'Administrar jugadores',
      link: '/admin/players',
      color: '#f093fb'
    },
    {
      title: 'Partidos',
      icon: '📅',
      description: 'Programar y ver partidos',
      link: '/admin/games',
      color: '#4facfe'
    },
    {
      title: 'Marcador en Vivo',
      icon: '🏀',
      description: 'Operar el marcador del partido',
      link: '/scoreboard',
      color: '#43e97b'
    }
  ];

  return (
    <div>
      <h1 className="mb-4 fw-bold">Dashboard</h1>
      <p className="text-muted mb-5">Bienvenido al panel de administración del tablero de baloncesto</p>

      <Row className="g-4">
        {cards.map((card, index) => (
          <Col md={6} lg={3} key={index}>
            <Link to={card.link} style={{ textDecoration: 'none' }}>
              <Card className="h-100 shadow-sm hover-card" style={{
                borderRadius: '15px',
                border: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}>
                <Card.Body className="text-center p-4">
                  <div
                    style={{
                      fontSize: '4rem',
                      marginBottom: '1rem'
                    }}
                  >
                    {card.icon}
                  </div>
                  <h3 className="fw-bold mb-2" style={{ color: card.color }}>
                    {card.title}
                  </h3>
                  <p className="text-muted mb-0">{card.description}</p>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <style>{`
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
}
