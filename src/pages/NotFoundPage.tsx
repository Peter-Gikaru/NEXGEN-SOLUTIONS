import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-bg-gray">
      <div className="text-center max-w-lg">
        <AlertTriangle className="h-20 w-20 text-secondary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-primary font-sans mb-2">404</h1>
        <h2 className="text-xl font-semibold text-primary mb-2">Page Not Found</h2>
        <p className="text-text-secondary text-base mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-secondary text-primary font-semibold px-6 py-3 rounded-lg hover:bg-amber-500 hover:text-white transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
