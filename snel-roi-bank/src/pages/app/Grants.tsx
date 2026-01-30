import React from 'react';

const Grants = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Grant Services</h1>
      <p className="text-gray-600 mb-6">Discover and apply for grants and funding opportunities</p>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Available Grants</h2>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg">Small Business Innovation Grant</h3>
            <p className="text-gray-600 mt-2">Supporting innovative small businesses with funding for research and development projects.</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-green-600 font-semibold">$50,000</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Apply Now
              </button>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg">Education Excellence Scholarship</h3>
            <p className="text-gray-600 mt-2">Merit-based scholarship for outstanding students pursuing higher education in STEM fields.</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-green-600 font-semibold">$15,000</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Apply Now
              </button>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg">Green Technology Development Fund</h3>
            <p className="text-gray-600 mt-2">Supporting sustainable technology development and environmental conservation projects.</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-green-600 font-semibold">$75,000</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grants;