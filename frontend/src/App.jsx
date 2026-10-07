import Navigation from './components/Navigation.jsx';
import Footer from './components/Footer.jsx';
import Hero from './components/Hero.jsx';
import Predictor from './components/Predictor.jsx';
import DataInsights from './components/DataInsights.jsx';
import ModelComparison from './components/ModelComparison.jsx';
import About from './components/About.jsx';

export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-white">
      <Navigation />
      
      {/* Introduction Content */}
      <Hero />

      <main className="flex-grow-1">
        
        {/* Top Section: EDA & Data Details */}
        <section id="insights" className="container my-5 py-3">
          <DataInsights />
        </section>

        <hr className="container text-muted my-5 opacity-25" />

        {/* Model Comparison Section */}
        <section id="models" className="container my-5 py-3">
          <ModelComparison />
        </section>

        {/* Divider */}
        <hr className="container text-muted my-5 opacity-25" />

        {/* Middle Section: The Predictor */}
        <section id="home" className="container my-5">
          <Predictor />
        </section>

        {/* Divider */}
        <hr className="container text-muted my-5 opacity-25" />

        {/* End of Page: The About Section */}
        <section id="about" className="container my-5 pb-5">
          <About />
        </section>

      </main>
      <Footer />
    </div>
  );
}
