
import React from 'react';
import BeerTapAnimation from '@/components/BeerTapAnimation';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Brrrvay</h1>
        <BeerTapAnimation 
          alertCount={0} 
          className="mb-6" 
          showEasterEgg={true}
        />
      </div>
      
      <p className="text-lg text-gray-600 mb-4 text-center">
        Revolutionizing beverage service with real-time monitoring and insights.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Smart Detection</h2>
          <p className="text-gray-600">
            Our AI-powered system detects empty glasses in real-time, ensuring prompt service.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Actionable Insights</h2>
          <p className="text-gray-600">
            Get detailed analytics and reports to optimize your service operations.
          </p>
        </div>
      </div>
    </div>
  );
}
