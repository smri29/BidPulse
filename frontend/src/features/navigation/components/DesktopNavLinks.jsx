import React from 'react';
import { Link } from 'react-router-dom';

const DesktopNavLinks = ({ links, currentPath }) => (
  <div className="hidden items-center gap-3 lg:flex">
    {links.map((item) => (
      <Link
        key={item.to}
        to={item.to}
        className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
          currentPath === item.to
            ? 'bg-slate-900 text-white'
            : 'text-slate-600 hover:bg-white hover:text-slate-900'
        }`}
      >
        {item.label}
      </Link>
    ))}
  </div>
);

export default DesktopNavLinks;
