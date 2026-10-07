import { Navbar, Nav, Container } from 'react-bootstrap';

export default function Navigation() {
  return (
    <Navbar bg="white" expand="lg" className="border-bottom py-3 sticky-top">
      <Container>
        <Navbar.Brand href="#home" className="fw-bold text-dark" style={{ letterSpacing: '-0.5px' }}>
          <span style={{ color: '#2e7d32' }}>🌱 Crop</span> Predictor
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="#insights" className="text-secondary">Insights</Nav.Link>
            <Nav.Link href="#models" className="text-secondary">Models</Nav.Link>
            <Nav.Link href="#home" className="text-secondary">Predictor</Nav.Link>
            <Nav.Link href="#about" className="text-secondary">About</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
