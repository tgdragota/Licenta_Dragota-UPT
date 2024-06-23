import React, {useContext, useEffect, useState} from "react";
import {RoleContext} from "../../RoleContext";
import {Link} from 'react-router-dom'

import ac from "../../Assets/ac.png"
import upt from "../../Assets/upt.png"
import cv from "../../Assets/cv.png"
import ccoc from "../../Assets/ccoc.png"
import liga from "../../Assets/liga.png"

import "./Home.css";
import serverUrl from "../../server";

export default function Home({handleLogout}) {

    const [session] = useContext(RoleContext);
    const [announcementInput, setAnnouncementInput] = useState("");
    const [announcements, setAnnouncements] = useState([]);
    const [showAnnouncementInput, setShowAnnouncementInput] = useState(false);
    const [reload, setReload] = useState(false);

    const handlePostAnnouncement = async () => {
        try {
            await fetch(serverUrl + `/announcements/${session.id}/add`, {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({message: announcementInput}),
            }).then(() => {
                setReload(true)
            });
        } catch (error) {
            console.log(error);
        }
        setAnnouncementInput("");
        setShowAnnouncementInput(false);
    };

    useEffect(() => {
        fetch(serverUrl + '/announcements/get')
            .then(response => response.json())
            .then(data => {
                setAnnouncements(data.announcements)
                setReload(false)
            });
    }, [reload]);

    return (<div className="home-page">
        <div className="content-boxes">
            <div className="content-box-left">
                <h2>Salut, {session.firstName}!</h2>
                <p>Bine ai venit pe licenta.upt.ro!</p>
            </div>
            <div className="content-box-right">
                <h2>Link-uri utile</h2>
                <br/><br/>
                <div className="button-container">
                    <a href="https://ac.upt.ro/" target="_blank" rel="noreferrer" className="image-button">
                        <img src={ac} alt="Image" className="links"/>
                    </a>
                    <a href="https://www.upt.ro/" target="_blank" rel="noreferrer" className="image-button">
                        <img src={upt} alt="Image" className="links"/>
                    </a>
                    <a href="https://cv.upt.ro/login/index.php" rel="noreferrer" target="_blank"
                       className="image-button">
                        <img src={cv} alt="Image" className="links"/>
                    </a>
                    <a href="https://ccoc.upt.ro/" target="_blank" rel="noreferrer" className="image-button">
                        <img src={ccoc} alt="Image" className="links"/>
                    </a>
                    <a href="https://ligaac.ro/" target="_blank" rel="noreferrer" className="image-button">
                        <img src={liga} alt="Image" className="links"/>
                    </a>
                </div>
            </div>
        </div>

        <div className="content-boxes">
            {session.role === 'professor' ? (<div className="content-box-right-bottom">
                <div className="button-container">
                    {session.isCoordinator === 1 && <Link to="/aprobare" className="button">
                        <i className="fa-solid fa-check-to-slot"></i>
                        <span>Studenți coordonați</span>
                    </Link>}
                    {session.isCommitteeMember === 1 && <Link to="/comisie" className="button">
                        <i className="fa-solid fa-people-group"></i>
                        <span>Comisie</span>
                    </Link>}
                    {session.isCommitteeMember === 1 && <Link to="/listaStudenti" className="button">
                        <i className="fa-solid fa-list"></i>
                        <span>Listă studenți</span>
                    </Link>}
                    <Link to="/" className="button" onClick={handleLogout}>
                        <i className="fa-solid fa-sign-out"></i>
                        <span>Delogare</span>
                    </Link>
                </div>
            </div>) : (session.role === 'student' ? (<div className="content-box-right-bottom">
                <div className="button-container">
                    <Link to="/comisie" className="button">
                        <i className="fa-solid fa-user-group"></i>
                        <span>Repartizare comisie</span>
                    </Link>
                    <Link to="/incarcare" className="button">
                        <i className="fa-solid fa-upload"></i>
                        <span>Înscriere licență</span>
                    </Link>
                    <Link to="/" className="button" onClick={handleLogout}>
                        <i className="fa-solid fa-sign-out"></i>
                        <span>Delogare</span>
                    </Link>
                </div>
            </div>) : (<div className="content-box-right-bottom">
                <div className="button-container">
                    <Link to="/crearecomisie" className="button">
                        <i className="fa-solid fa-people-group"></i>
                        <span>Creare comisie</span>
                    </Link>
                    <Link to="/generare" className="button">
                        <i className="fa-solid fa-arrows-rotate"></i>
                        <span>Generare repartizări</span>
                    </Link>
                    <Link to="/uploadCreator" className="button">
                        <i className="fa-solid fa-upload"></i>
                        <span>Setări încărcare</span>
                    </Link>
                    <Link to="/stats" className="button">
                        <i className="fa-solid fa-chart-simple"></i>
                        <span>Statistici note</span>
                    </Link>
                    <Link to="/" className="button" onClick={handleLogout}>
                        <i className="fa-solid fa-sign-out"></i>
                        <span>Delogare</span>
                    </Link>
                </div>
            </div>))}
            <div className="content-box-right">
                <h2>
                    Anunțuri{" "}
                    {(session.role === 'professor' || session.role === 'secretary') && (<button
                        className="add-announcement-button"
                        onClick={() => setShowAnnouncementInput(!showAnnouncementInput)}
                    >
                        {showAnnouncementInput === false ? '+' : '-'}
                    </button>)}
                </h2>
                {showAnnouncementInput && (<div className="announcement-input-container">
                            <textarea
                                placeholder="Introdu anunțul..."
                                value={announcementInput}
                                onChange={(e) => setAnnouncementInput(e.target.value)}
                            />
                    <button className="button" onClick={handlePostAnnouncement}>
                        Postează
                    </button>
                </div>)}
                <div className="announcement-list">
                    {announcements.slice(0).reverse().map((announcement, index) => (
                        <div key={index} className="announcement-item">
                            <p className="announcement-timestamp">{announcement.author.toUpperCase() + ' / ' + announcement.time}</p>
                            <p className="announcement-text">{announcement.message}</p>
                        </div>))}
                </div>
            </div>
        </div>
    </div>);
}
