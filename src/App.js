import React, {useState} from 'react';
import {RoleContext} from './RoleContext';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import serverUrl from "./server";

import SideBar from './common/SideBar/SideBar';
import Login from './common/Login/Login';
import Home from './common/Home/Home';
import CommitteeStudents from './professor/CommitteeStudents/CommitteeStudents';
import OwnCommittee from './common/OwnCommittee/OwnCommittee';
import CoordinatorStudents from './professor/CoordinatorStudents/CoordinatorStudents';
import CommitteeCreator from './secretary/CommitteeCreator/CommitteeCreator';
import Upload from "./student/Upload/Upload";
import CommitteeStudentsGenerator from "./secretary/CommitteeGenerator/CommitteeStudentsGenerator";
import StudentStats from "./secretary/StudentStats/StudentStats";
import PresidentTable from "./professor/PresidentTable/PresidentTable";
import UploadCreator from "./secretary/UploadCreator/UploadCreator";

function App() {
    const [session, setSession] = useState({
        id: null, role: null, firstName: null, isSecretary: null, isCoordinator: null, isCommitteeMember: null
    });

    const handleLogout = () => {
        fetch(serverUrl + `/session/${session.id}`, {
            method: 'DELETE',
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Cererea a eșuat');
            }
            return response.text();
        })
        .then(() => {
            setSession({id: null, role: null, firstName: null, isSecretary: null, isCoordinator: null, isCommitteeMember: null});
        })
        .catch((error) => {
            console.error('Eroare:', error);
        });
    };

    return (<RoleContext.Provider value={[session, setSession]}>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route
                    path="/*"
                    element={session.id ? (<div>
                        <SideBar
                            handleLogout={handleLogout}
                        />
                        <Routes>
                            <Route path="/home" element={<Home handleLogout={handleLogout}/>}/>
                            <Route
                                path="/incarcare"
                                element={<Upload/>}
                            />
                            <Route
                                path="/aprobare"
                                element={<CoordinatorStudents/>}
                            />
                            <Route
                                path="/comisie"
                                element={<OwnCommittee/>}
                            />
                            <Route
                                path="/listaStudenti"
                                element={<CommitteeStudents/>}
                            />
                            <Route
                                path="/crearecomisie"
                                element={<CommitteeCreator/>}
                            />
                            <Route
                                path="/generare"
                                element={<CommitteeStudentsGenerator/>}
                            />
                            <Route
                                path="/stats"
                                element={<StudentStats/>}
                            />
                            <Route
                                path="/allGrades"
                                element={<PresidentTable/>}
                            />
                            <Route
                                path="/uploadCreator"
                                element={<UploadCreator/>}
                            />
                        </Routes>
                    </div>) : (<Navigate to="/" replace={true}/>)}
                />
            </Routes>
        </BrowserRouter>
    </RoleContext.Provider>);
}

export default App;
