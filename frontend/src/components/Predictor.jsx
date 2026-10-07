import axios from 'axios';
import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

export default function Predictor() {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predictionData, setPredictionData] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const [formData, setFormData] = useState({
    Region: '',
    Soil_Type: '',
    Crop: '',
    Weather_Condition: '',
    Rainfall_mm: 500,
    Temperature_Celsius: 25,
    Fertilizer_Used: false,
    Irrigation_Used: false,
    Days_to_Harvest: 100
  });

  useEffect(() => {
    axios.get('http://localhost:8000/options')
      .then(res => {
        setOptions(res.data);
        setFormData(prev => ({
          ...prev,
          Region: res.data.regions[0],
          Soil_Type: res.data.soil_types[0],
          Crop: res.data.crops[0],
          Weather_Condition: res.data.weather_conditions[0]
        }));
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching options:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPredicting(true);
    try {
      const payload = {
        ...formData,
        Rainfall_mm: parseFloat(formData.Rainfall_mm),
        Temperature_Celsius: parseFloat(formData.Temperature_Celsius),
        Days_to_Harvest: parseInt(formData.Days_to_Harvest)
      };
      
      const res = await axios.post('http://localhost:8000/compare', payload);
      setPredictionData(res.data.comparison);
    } catch (err) {
      alert("Error predicting yield. Make sure FastAPI backend is running!");
    }
    setPredicting(false);
  };

  if (loading) {
    return <div className="text-center my-5"><Spinner animation="border" variant="success" style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }} /></div>;
  }

  // Format chart data
  const chartData = predictionData ? Object.entries(predictionData).map(([key, val]) => ({
    name: key.replace('_', ' '),
    Yield: typeof val === 'number' ? val : 0,
    originalValue: val
  })) : [];

  return (
    <div>
      <div className="text-center mb-5">
        <h2 className="fw-bold text-dark">Yield Predictor</h2>
        <p className="text-secondary mb-4">Enter your field parameters below to compare predictions across all ML models.</p>
      </div>

      <Row className="justify-content-center">
        <Col lg={8} md={10}>
          <div className="mb-5 p-5 border rounded bg-white">

          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label className="fw-bold">Region</Form.Label>
                <Form.Select name="Region" value={formData.Region} onChange={handleChange}>
                  {options?.regions.map(r => <option key={r} value={r}>{r}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label className="fw-bold">Crop</Form.Label>
                <Form.Select name="Crop" value={formData.Crop} onChange={handleChange}>
                  {options?.crops.map(c => <option key={c} value={c}>{c}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label className="fw-bold">Soil Type</Form.Label>
                <Form.Select name="Soil_Type" value={formData.Soil_Type} onChange={handleChange}>
                  {options?.soil_types.map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md="6" className="mb-3">
                <Form.Label className="fw-bold">Weather</Form.Label>
                <Form.Select name="Weather_Condition" value={formData.Weather_Condition} onChange={handleChange}>
                  {options?.weather_conditions.map(w => <option key={w} value={w}>{w}</option>)}
                </Form.Select>
              </Form.Group>
            </Row>

            <Row className="mb-4">
              <Form.Group as={Col} md="4" className="mb-3">
                <Form.Label className="fw-bold">Rainfall (mm)</Form.Label>
                <Form.Control type="number" name="Rainfall_mm" value={formData.Rainfall_mm} onChange={handleChange} />
              </Form.Group>
              <Form.Group as={Col} md="4" className="mb-3">
                <Form.Label className="fw-bold">Temp (°C)</Form.Label>
                <Form.Control type="number" name="Temperature_Celsius" value={formData.Temperature_Celsius} onChange={handleChange} />
              </Form.Group>
              <Form.Group as={Col} md="4" className="mb-3">
                <Form.Label className="fw-bold">Days to Harvest</Form.Label>
                <Form.Control type="number" name="Days_to_Harvest" value={formData.Days_to_Harvest} onChange={handleChange} />
              </Form.Group>
            </Row>

            <Row className="mb-4">
              <Col>
                <Form.Check type="switch" id="fert-switch" label="Fertilizer Used" name="Fertilizer_Used" checked={formData.Fertilizer_Used} onChange={handleChange} className="fw-bold text-success" />
              </Col>
              <Col>
                <Form.Check type="switch" id="irr-switch" label="Irrigation Used" name="Irrigation_Used" checked={formData.Irrigation_Used} onChange={handleChange} className="fw-bold text-primary" />
              </Col>
            </Row>

            <Button variant="success" style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }} type="submit" size="lg" className="w-100 rounded-pill" disabled={predicting}>
              {predicting ? 'Calculating...' : 'Run All Models'}
            </Button>
          </Form>
          </div>
        </Col>
      </Row>

      {predictionData && (
        <div className="mt-5">
          <h3 className="mb-4 text-center">
            Prediction Results <span className="fs-6 text-muted fw-normal">(tons/ha)</span>
          </h3>

          <div className="mb-4 p-4 border rounded bg-white">
            <h5 className="mb-3 text-center">Predicted Yield by Model</h5>
            <div style={{ height: "350px", width: "100%" }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} tons/ha`, 'Predicted Yield']} />
                  <Bar dataKey="Yield" fill="#2e7d32" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Yield" position="top" fill="#333" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Row className="g-4">
            {Object.entries(predictionData).map(([model, val]) => (
              <Col md={3} sm={6} key={model}>
                <Card className="text-center h-100 border-0 bg-light">
                  <Card.Header className="bg-transparent border-0 text-secondary fw-semibold text-uppercase" style={{fontSize: '0.8rem'}}>
                    {model.replace('_', ' ')}
                  </Card.Header>
                  <Card.Body className="d-flex align-items-center justify-content-center">
                    <h4 className={`mb-0 ${typeof val === 'number' ? 'text-success' : 'text-danger'}`}>
                      {val}
                    </h4>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
}
