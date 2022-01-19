import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import Applications from './views/Applications';
import EditJob from './views/EditJob';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/Apps" element={<Applications />} />
          <Route path='/editJob/:jobId' element={<EditJob/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
