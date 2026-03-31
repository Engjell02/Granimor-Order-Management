import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { DataProvider } from './DataContext';
import { LanguageProvider } from './LanguageContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <LanguageProvider>
    <DataProvider>
      <App />
    </DataProvider>
  </LanguageProvider>
);