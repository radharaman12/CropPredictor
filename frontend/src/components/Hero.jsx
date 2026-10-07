import { Container, Row, Col } from 'react-bootstrap';

export default function Hero() {
  return (
    <div className="bg-white py-5 mb-4 border-bottom">
      <Container className="py-5">
        <Row className="justify-content-center text-center">
          <Col lg={8}>
            <h1 className="fw-bold mb-4 text-dark" style={{ letterSpacing: '-1px', fontSize: '3.5rem' }}>
              Forecast your crop yield.
            </h1>
            <p className="text-secondary mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
              We trained machine learning models on historical agricultural data. 
              Enter your soil and weather conditions below to see what you can expect to harvest.
            </p>
            <a href="#home" className="btn text-white px-4 py-2 rounded-pill" style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
>
              Try the Predictor
            </a>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
