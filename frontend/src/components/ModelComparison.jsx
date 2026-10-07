import axios from 'axios';
import { useState, useEffect } from "react";
import { Card, Table, Badge } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ModelComparison() {
  const [modelsData, setModelsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8000/models_info")
      .then(res => {
        setModelsData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching models info:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-center">Loading model comparison...</p>;
  }

  // Format data for chart (R2 is percentage, MAE is actual)
  const chartData = modelsData.map(d => ({
    name: d.Model,
    "R2 Score": d.R2_Score,
    "Mean Absolute Error": d.MAE
  }));

  // Best model logic
  const bestModel = [...modelsData].sort((a, b) => b.R2_Score - a.R2_Score)[0];

  return (
    <>
      <div className="text-center mb-5">
        <h2 className="fw-bold text-dark">Model Performance Comparison</h2>
        <p className="text-secondary">
          We evaluated 7 machine learning models to predict crop yields. 
          <strong> {bestModel?.Model} </strong> achieved the highest R² score.
        </p>
      </div>

      <div className="p-4 border rounded bg-white">

      <div className="row">
        <div className="col-md-6 mb-4">
          <h5>Performance Metrics</h5>
          <div style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer>
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 1]} />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="R2 Score" fill="#2e7d32" name="R² Score (Higher is better)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <h5>Metrics Table</h5>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Model</th>
                <th>R² Score</th>
                <th>MAE (tons/ha)</th>
              </tr>
            </thead>
            <tbody>
              {modelsData.map((m, idx) => (
                <tr key={idx} className={m.Model === bestModel.Model ? "table-success" : ""}>
                  <td>
                    {m.Model} {m.Model === bestModel.Model && <Badge bg="success">Best</Badge>}
                  </td>
                  <td>{m.R2_Score.toFixed(4)}</td>
                  <td>{m.MAE.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <small className="text-muted">
            * <strong>R² Score</strong>: Explains the proportion of variance in yield predictable from features. (closer to 1.0 is better)<br/>
            * <strong>MAE (Mean Absolute Error)</strong>: Average absolute difference between predicted and actual yield. (lower is better)
          </small>
        </div>
      </div>
    </div>
    </>
  );
}
