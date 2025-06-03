import React from 'react';

export default function BoltBadge() {
  return (
    <a
      href="https://bolt.new"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 transition-transform hover:scale-105"
    >
      <img
        src="/white_circle_360x360.png"
        alt="Powered by Bolt"
        className="w-4 h-4 md:w-6 md:h-6"
      />
    </a>
  );
}