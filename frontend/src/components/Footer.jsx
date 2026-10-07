import { Container } from 'react-bootstrap';

export default function Footer() {
  return (
    <footer className="bg-white border-top py-5 mt-auto">
      <Container className="text-center">
        <p className="mb-2 text-dark fw-medium">Agriculture ML Project</p>
        <small className="text-secondary">Designed to be simple. Powered by React and FastAPI.</small>
      </Container>
    </footer>
  );
}
