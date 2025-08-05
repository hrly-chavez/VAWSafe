import Navbar from "./Navbar";
import Sidebar from "./sidebar";
import './css/DSWDService.css';

export default function DSWDServices () {
    return (
        <>
            <Navbar />

            <div className="main-container">
                <Sidebar />

                <div className="inside-container">
                    <h2 className="servicetext">Service</h2>

                    <p className="list-text">List of Services</p>

                    <div className="row-one">
                        <div className="search">
                                <input type="text" value="Search" className="searchbar"></input>
                                <img src="./images/loupe.png"></img>
                        </div>

                        <div className="row-one-filter">
                            <div className="filter-group">
                                <label for="service" className="service">Service</label>
                                <select id="service" name="service">
                                    <option value="All">All</option>
                                    <option value="Male">Financial</option>
                                </select>
                            </div>
                            
                            <div className="filter-group">
                                <label for="type" className="type">Case Type</label>
                                <select id="type" name="type">
                                    <option value="All">All</option>
                                    <option value="Physical">Physical</option>
                                    <option value="Emotional">Emotional</option>
                                    <option value="Sexual">Sexual</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="table-victims">
                            <thead>
                                <th>Victim No.</th>
                                <th>Victim Name</th>
                                <th>Schedule</th>
                                <th>Case Type</th>
                                <th>Service</th>
                                <th>Intake Form</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Rhodjien Caratao</td>
                                    <td>    </td>
                                    <td>Pschological Abuse</td>
                                    <td>In Progress</td>
                                    <td><a href="#">View Form</a></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
        
    );
}