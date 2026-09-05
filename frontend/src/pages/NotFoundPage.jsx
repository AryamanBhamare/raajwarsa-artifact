import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="notfound">
      <div className="notfound__inner container">
        <span className="notfound__code">404</span>
        <div className="notfound__line" aria-hidden="true" />
        <h1 className="notfound__title">THE ARCHIVE HAS NO RECORD OF THIS PAGE.</h1>
        <p className="notfound__sub">
          The page you are looking for has either moved or does not exist in the archive.
        </p>
        <div className="notfound__actions">
          <Link to="/" className="btn btn--primary">Return Home</Link>
          <Link to="/collection" className="btn btn--outline">Explore the Collection</Link>
        </div>
      </div>
    </div>
  );
}