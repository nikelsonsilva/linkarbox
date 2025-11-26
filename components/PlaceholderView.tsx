import React from 'react';
import { Compass } from 'lucide-react';

interface PlaceholderViewProps {
  pageName: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ pageName }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <Compass className="w-12 h-12 text-primary" strokeWidth={1.5} />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">{pageName}</h2>
      <p className="max-w-md">
        The content for the <span className="font-semibold text-primary">{pageName}</span> page is currently under construction. 
        Please check back later for updates!
      </p>
    </div>
  );
};

export default PlaceholderView;
