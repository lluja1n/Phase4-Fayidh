import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/Layout.jsx';
import Home from './pages/m2-browse/Home.jsx';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </AppLayout>
  );
}
