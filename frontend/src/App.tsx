import React from 'react';
import './App.css';
import Pages from "./pages";
import { Toaster } from "./components/ui/toaster";

const App: React.FC = () => {
  return (
    <>
      <Pages />
      <Toaster />
    </>
  );
};

export default App; 