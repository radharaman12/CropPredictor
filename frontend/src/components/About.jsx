export default function About() {
  return (
    <>
      <div className="text-center mb-5">
        <h2 className="fw-bold text-dark">About This Project</h2>
        <p className="text-secondary">Learn more about the architecture and algorithms.</p>
      </div>
      <div className="p-5 border rounded bg-white">
      <p className="text-secondary" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
        This application uses advanced Machine Learning models to predict crop yields 
        based on critical environmental and agricultural factors.
      </p>
      <p className="text-secondary" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
        Instead of relying on a single algorithm, our backend seamlessly queries 7 different models 
        (including XGBoost, Random Forest, and Linear Regression) to provide a comprehensive 
        comparison of expected yields side-by-side. 
      </p>
      <hr className="my-4 opacity-25" />
      <h5 className="fw-bold mb-3">Tech Stack</h5>
      <ul className="text-secondary">
        <li><strong>Frontend:</strong> React.js, Vite, React-Bootstrap, Recharts</li>
        <li><strong>Backend:</strong> Python, FastAPI, Pandas, Scikit-Learn</li>
      </ul>
    </div>
    </>
  );
}
