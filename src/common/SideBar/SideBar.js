import React, {useContext, useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {RoleContext} from "../../RoleContext";
import SideNav, {NavIcon, NavItem, NavText} from '@trendmicro/react-sidenav';

import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import './SideBar.css';


function SideBar({handleLogout}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [session] = useContext(RoleContext);
    const ref = useRef(null);
    const [defaultSelected, setDefaultSelected] = useState('home');

    const handleLogoutClick = () => {
        handleLogout();
        navigate('/');
    };

    const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, []);

    const handleToggleClick = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const pathname = location.pathname.substring(1);
        setDefaultSelected(pathname || 'home');
    }, [location.pathname]);

    return (<div ref={ref}>
        {session.role === 'professor' ? (<SideNav
            onSelect={(selected) => {
                navigate('/' + selected)
            }}
            expanded={isOpen}
            className='sidebar'
        >
            <SideNav.Toggle onClick={handleToggleClick}/>
            <SideNav.Nav selected={defaultSelected}>
                <NavItem eventKey="home">
                    <NavIcon>
                        <i className='fa fa-fw fa-home'/>
                    </NavIcon>
                    <NavText>Acasă</NavText>
                </NavItem>
                {session.isCoordinator === 1 && <NavItem eventKey="aprobare">
                    <NavIcon>
                        <i className="fa-solid fa-check-to-slot"></i>
                    </NavIcon>
                    <NavText>Studenți coordonați</NavText>
                </NavItem>}
                {session.isCommitteeMember === 1 && <NavItem eventKey="comisie">
                    <NavIcon>
                        <i className="fa-solid fa-people-group"></i>
                    </NavIcon>
                    <NavText>Comisie</NavText>
                </NavItem>}
                {session.isCommitteeMember === 1 && <NavItem eventKey="listaStudenti">
                    <NavIcon>
                        <i className="fa-solid fa-list"></i>
                    </NavIcon>
                    <NavText>Lista studenți</NavText>
                </NavItem>}
                <button className="logout-button" onClick={handleLogoutClick}><i
                    className="fa-solid fa-sign-out"></i></button>
            </SideNav.Nav>
        </SideNav>) : (session.role === 'student' ? (<SideNav
            onSelect={selected => {
                console.log(selected);
                navigate('/' + selected)
                console.log(selected)
                console.log(session.role)
            }}
            expanded={isOpen}
            className='sidebar'
        >
            <SideNav.Toggle onClick={handleToggleClick}/>
            <SideNav.Nav selected={defaultSelected}>
                <NavItem eventKey="home">
                    <NavIcon>
                        <i className='fa fa-fw fa-home'/>
                    </NavIcon>
                    <NavText>Acasă</NavText>
                </NavItem>
                <NavItem eventKey="comisie">
                    <NavIcon>
                        <i className="fa-solid fa-user-group"></i>
                    </NavIcon>
                    <NavText>Comisie</NavText>
                </NavItem>
                <NavItem eventKey="incarcare">
                    <NavIcon>
                        <i className="fa-solid fa-upload"></i>
                    </NavIcon>
                    <NavText>Înscriere susținere</NavText>
                </NavItem>
                <button className="logout-button" onClick={handleLogoutClick}><i
                    className="fa-solid fa-sign-out"></i></button>
            </SideNav.Nav>
        </SideNav>) : (<SideNav
            onSelect={selected => {
                console.log(selected);
                navigate('/' + selected)
                console.log(selected)
                console.log(session.role)
            }}
            expanded={isOpen}
            className='sidebar'
        >
            <SideNav.Toggle onClick={handleToggleClick}/>
            <SideNav.Nav selected={defaultSelected}>
                <NavItem eventKey="home">
                    <NavIcon>
                        <i className='fa fa-fw fa-home'/>
                    </NavIcon>
                    <NavText>Acasă</NavText>
                </NavItem>
                <NavItem eventKey="crearecomisie">
                    <NavIcon>
                        <i className="fa-solid fa-people-group"></i>
                    </NavIcon>
                    <NavText>Creare comisie</NavText>
                </NavItem>
                <NavItem eventKey="generare">
                    <NavIcon>
                        <i className="fa-solid fa-arrows-rotate"></i>
                    </NavIcon>
                    <NavText>Generare repartizare</NavText>
                </NavItem>
                <NavItem eventKey="uploadCreator">
                    <NavIcon>
                        <i className="fa-solid fa-upload"></i>
                    </NavIcon>
                    <NavText>Incărcare setări</NavText>
                </NavItem>
                <NavItem eventKey="stats">
                    <NavIcon>
                        <i className="fa-solid fa-chart-simple"></i>
                    </NavIcon>
                    <NavText>Statistică note studenți</NavText>
                </NavItem>
                <button className="logout-button" onClick={handleLogoutClick}><i
                    className="fa-solid fa-sign-out"></i></button>
            </SideNav.Nav>
        </SideNav>))}
    </div>);
}

export default SideBar;
