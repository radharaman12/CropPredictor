import axios from 'axios';
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DataInsights() {
  const [edaData, setEdaData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/eda')
      .then(res => setEdaData(res.data))
      .catch(err => console.error("Failed to load EDA:", err));
  }, []);

  if (!edaData) return null;

  return (
    <Container>
      <div className="text-center mb-5">
        <h2 className="fw-bold text-dark">Exploratory Data Analysis</h2>
        <p className="text-secondary">Insights derived from {edaData.total_records.toLocaleString()} historical farming records.</p>
      </div>
      
      {/* First Row of Charts */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <div className="border rounded bg-white h-100 p-4">
            
              <h5 className="fw-bold mb-4 text-center text-secondary">Average Yield by Crop</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={edaData.crop_yield}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fill: '#6c757d'}} />
                    <YAxis tick={{fill: '#6c757d'}} />
                    <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="yield" fill="#2e7d32" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            
          </div>
        </Col>
        
        <Col lg={6}>
          <div className="border rounded bg-white h-100 p-4">
            
              <h5 className="fw-bold mb-4 text-center text-secondary">Average Yield by Region</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={edaData.region_yield}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fill: '#6c757d'}} />
                    <YAxis tick={{fill: '#6c757d'}} />
                    <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="yield" fill="#0288d1" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            
          </div>
        </Col>
      </Row>

      {/* Second Row of Charts */}
      <Row className="g-4 mb-5">
        <Col lg={6}>
          <div className="border rounded bg-white h-100 p-4">
            
              <h5 className="fw-bold mb-4 text-center text-secondary">Average Yield by Soil Type</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={edaData.soil_yield}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fill: '#6c757d'}} />
                    <YAxis tick={{fill: '#6c757d'}} />
                    <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="yield" fill="#8d6e63" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            
          </div>
        </Col>
        
        <Col lg={6}>
          <div className="border rounded bg-white h-100 p-4">
            
              <h5 className="fw-bold mb-4 text-center text-secondary">Average Yield by Weather</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={edaData.weather_yield}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fill: '#6c757d'}} />
                    <YAxis tick={{fill: '#6c757d'}} />
                    <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="yield" fill="#fbc02d" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            
          </div>
        </Col>
      </Row>

      {/* Numerical Stats and Dataset Details */}
      <Row className="g-4">
        <Col lg={5}>
          <div className="border rounded bg-white h-100 p-4">
            
                <h4 className="fw-bold text-dark mb-4">Historical Averages</h4>
                <Table borderless hover responsive className="align-middle">
                  <thead className="border-bottom">
                    <tr>
                      <th className="text-secondary">Metric</th>
                      <th className="text-secondary text-center">Min</th>
                      <th className="text-secondary text-center">Avg</th>
                      <th className="text-secondary text-center">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(edaData.numerical_stats).map(([metric, stats]) => (
                      <tr key={metric}>
                        <td className="fw-bold">{metric}</td>
                        <td className="text-center text-muted">{stats.min}</td>
                        <td className="text-center fw-bold text-dark">{stats.avg}</td>
                        <td className="text-center text-muted">{stats.max}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
            
          </div>
        </Col>

        <Col lg={7}>
          <div className="border rounded bg-white h-100 p-4">
            
                <h4 className="fw-bold text-dark mb-3">Dataset Details & Features</h4>
                <p className="text-muted" style={{fontSize: '1.05rem', lineHeight: '1.7'}}>
                  The prediction engines are trained on a comprehensive historical dataset containing <strong>{edaData.total_records.toLocaleString()}</strong> records. 
                  The target variable is <strong>Yield (tons per hectare)</strong>. The models process environmental and agricultural practices using One-Hot Encoding for categorical features 
                  and numerical scaling for continuous parameters.
                </p>
                <h6 className="mt-4 mb-3 fw-bold text-secondary">Features Used in Training:</h6>
                <div className="d-flex flex-wrap gap-2">
                    {edaData.features.map(f => (
                        <Badge key={f} bg="light" text="dark" className="border px-3 py-2" style={{fontSize: "0.9rem"}}>
                            {f.replace(/_/g, ' ')}
                        </Badge>
                    ))}
                </div>
            
          </div>
        </Col>
      </Row>
    </Container>
  );
}
