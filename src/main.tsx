import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { loadModelCatalog } from './assets/modelCatalog';
import { checkArmyAssets } from './dev/checkArmyAssets';
import './styles.css';

void loadModelCatalog();
checkArmyAssets();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
