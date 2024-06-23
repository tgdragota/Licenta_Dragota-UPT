import React, {useContext, useState} from 'react';
import {Helmet} from 'react-helmet';
import {RoleContext} from '../../RoleContext';
import {useNavigate} from 'react-router-dom';

import email_icon from '../../Assets/email.png';
import password_icon from '../../Assets/password.png';
import logo from '../../Assets/logo.png';

import './Login.css';
import serverUrl from "../../server";


const Login = () => {
    const [session, setSession] = useContext(RoleContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    let navigate = useNavigate();

    const handleSubmit = async () => {
        setLoading(true);
        if (email.trim() === '' || password.trim() === '') {
            setError('Date de autentificare lipsă.');
        } else {
            try {
                await fetch(serverUrl + `/session/new`, {
                    method: 'POST', headers: {
                        'Content-Type': 'application/json',
                    }, body: JSON.stringify({email, password}),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.role !== "") {
                            navigate('/home');
                        }
                        setSession({
                            id: data.sessionId,
                            role: data.role,
                            firstName: data.firstName,
                            isSecretary: data.isSecretary,
                            isCoordinator: data.isCoordinator,
                            isCommitteeMember: data.isCommitteeMember
                        });
                        console.log(session.id)
                    });
            } catch (error) {
                console.log(error);
                setError('Date de autentificare incorecte.');
            }
        }
        setLoading(false);
    };

    return (<div id="login-page">
        <div className="background-component">
            <Helmet>
                <meta charSet="utf-8"/>
                <title>Licență UPT</title>
            </Helmet>
            <div className="container-login">
                <img className="logo" src={logo} alt="Logo"/>
                <div className="header">
                    <div className="text">Autentificare</div>
                    <div className="underline"></div>
                </div>
                <div className="inputs">
                    <div className="input">
                        <img src={email_icon} alt=""/>
                        <input
                            type="email"
                            placeholder="Adresă de mail"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input">
                        <img src={password_icon} alt=""/>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Parolă"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                    </div>
                </div>
                <div className="submit-container">
                    <div className="submit" onClick={handleSubmit}>
                        {loading ? 'Se autentifică...' : 'Intră în cont'}
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="resetare-parola">
                        <a href="https://student.upt.ro/docs/Instructiuni%20resetare%20parola%20cont-UPT.pdf"
                           rel="noreferrer" target="_blank">
                            Ai uitat parola?
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>);
};

export default Login;
