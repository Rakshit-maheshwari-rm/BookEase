import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
      <h1 className="display-1 fw-bold">404</h1>
      <h2 className="mb-4">Page Not Found</h2>
      <p className="text-white mb-4 text-center px-3">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary px-4 py-2 rounded-pill">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
