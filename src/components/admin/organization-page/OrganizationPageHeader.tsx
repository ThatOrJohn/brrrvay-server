
import React from 'react';

export default function OrganizationPageHeader() {
  return (
    <div className="mb-8 transform transition-all duration-300 hover:scale-[1.01]">
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
        Organization Management
      </h1>
      <p className="text-[#888888] transition-colors duration-300 hover:text-[#aaaaaa]">
        Manage your organizations, concepts, stores, and users with ease
      </p>
    </div>
  );
}
