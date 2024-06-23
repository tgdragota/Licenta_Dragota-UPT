import React, {useContext, useEffect, useState} from 'react';
import {RoleContext} from "../../RoleContext";

import './OwnCommittee.css'
import serverUrl from "../../server";

const OwnCommittee = () => {

    const [session] = useContext(RoleContext);
    const [loading, setLoading] = useState(true)
    const [committee, setCommittee] = useState({
        committeeId: null, president: '', secretary: '', members: ['']
    })

    useEffect(() => {
        if (session.role === "student") {
            fetch(serverUrl + `/committees/student/${session.id}`)
                .then(response => response.json())
                .then(data => {
                    setLoading(false)
                    setCommittee(data)
                    console.log(committee)
                });
        } else if (session.role === "professor") {
            fetch(serverUrl + `/committees/prof/${session.id}`)
                .then(response => response.json())
                .then(data => {
                    setLoading(false)
                    setCommittee(data)
                    console.log(committee)
                });
        }
    }, []);

    return (<div>
        {loading === false && (<div className="tabel-container-comisie">
            <h2 className="titlu-tabel-comisie">Comisia numărul {committee.committeeId}</h2>
            <div className="spatiu-deasupra"></div>
            <table>
                <thead>
                <tr style={{backgroundColor: '#2d3192', color: '#fff'}}>
                    <th>Nr. crt</th>
                    <th>Nume profesor</th>
                    <th>Funcție</th>
                </tr>
                </thead>
                <tbody>
                <tr key={1}>
                    <td>{1}</td>
                    <td>{committee.president}</td>
                    <td>Președinte</td>
                </tr>
                <tr key={2}>
                    <td>{2}</td>
                    <td>{committee.secretary}</td>
                    <td>Secretar</td>
                </tr>
                {committee.members.map((item, index) => (<tr key={index + 3}>
                    <td>{index + 3}</td>
                    <td>{item}</td>
                    <td>Membru</td>
                </tr>))}
                </tbody>
            </table>
        </div>)}
    </div>);
};

export default OwnCommittee;
