import Navbar from "./Navbar";
import Sidebar from "./sidebar";
import './DSWDVAWCVictims.css';

export default function DSWDVAWCVictims () {
    return (
        <>
            <Navbar />

            <div className="main-container">
                <Sidebar />

                <div className="inside-container">
                    <h2 className="VAWC">VAWC Victims</h2>
                    <div className="row-one">
                        <p className="list-text">List of VAWC Victims</p>
                        <div className="row-one-filter">
                            <div className="filter-group">
                                <label for="gender" className="gender">Gender </label>
                                <select id="gender" name="gender">
                                    <option value="All">All</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            
                            <div className="filter-group">
                                <label for="type" className="type">Type of Violence</label>
                                <select id="type" name="type">
                                    <option value="All">All</option>
                                    <option value="Physical">Physical</option>
                                    <option value="Emotional">Emotional</option>
                                    <option value="Sexual">Sexual</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="row-two">
                        <div className="search">
                            <input type="text" value="Search" className="searchbar"></input>
                            <img src="./images/loupe.png"></img>
                        </div>
                        
                        <div className="filter-group">
                            <div className="row-two-filter">
                                <label for="perpetrator" className="perpetrator">Perpetrator</label>
                                <select id="perpetrator" name="perpetrator">
                                    <option value="All">All</option>
                                    <option value="Physical">Physical</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="table-victims">
                            <thead>
                                <th>Victim No.</th>
                                <th>Victim Name</th>
                                <th>Gender</th>
                                <th>Type of Violence</th>
                                <th>Perpetrators</th>
                                <th>Intake Form</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Rhodjien Caratao</td>
                                    <td>Female</td>
                                    <td>Type of Violence</td>
                                    <td>Stranger</td>
                                    <td><a href="#">View Form</a></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            

            
        </>
    );
};