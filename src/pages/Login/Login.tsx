import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postLogin } from '../../services/authService'; // Corrigido de 'login' para 'postLogin'
import { useUser } from '../../src/context/UserContext';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('leonardovinicius_silva@hotmail.com');
  const [password, setPassword] = useState('Teste123!');
  const [reminder, setReminder] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result: any = await postLogin({ username, password, reminder }); // Usa 'postLogin' aqui
    if (result.status === 200) {
      setUser(result.data)
      navigate('/home'); // Redireciona para a página inicial ao fazer login
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={reminder}
              onChange={() => setReminder(!reminder)}
            />
            Lembrar-me
          </label>
        </div>

        <button type="submit" className="login-button">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
