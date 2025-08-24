import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import NovaAta from './pages/NovaAta'
import ListaAtas from './pages/ListaAtas'
import VisualizarAta from './pages/VisualizarAta'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import EsqueciSenha from './pages/EsqueciSenha'
import ProprietarioLogin from './pages/ProprietarioLogin'
import Usuarios from './pages/Usuarios'
import OracoesSacramentais from './pages/OracoesSacramentais'
import Admin from './pages/Admin'
import ProprietarioPanel from './pages/ProprietarioPanel'
import Perfil from './pages/Perfil'
import { AtaProvider } from './context/AtaContext'
import { AuthProvider } from './context/AuthContext'

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/proprietario-login" element={<ProprietarioLogin />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      <Route path="/proprietario" element={<ProprietarioPanel />} />
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/nova-ata" element={<NovaAta />} />
            <Route path="/editar-ata/:id" element={<NovaAta />} />
            <Route path="/atas" element={<ListaAtas />} />
            <Route path="/ata/:id" element={<VisualizarAta />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/oracoes-sacramentais" element={<OracoesSacramentais />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/perfil" element={<Perfil />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AtaProvider>
        <AppRoutes />
      </AtaProvider>
    </AuthProvider>
  )
}

export default App