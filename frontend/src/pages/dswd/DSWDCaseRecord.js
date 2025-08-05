import Navbar from "./Navbar";
import Sidebar from "./sidebar";
import './css/DSWDCaseRecord.css';

export default function DSWDCaseRecord () {
    return (
        <>
            <Navbar />

            <div className="main-container">
                <Sidebar />

                <div className="inside-container">
                    <h2 className="caserecord">Case Record</h2>

                    <p className="list-text">List of Case Record</p>

                    <div className="row-one">
                        <div className="search">
                                <input type="text" value="Search" className="searchbar"></input>
                                <img src="./images/loupe.png"></img>
                        </div>

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
                                <th>Case No.</th>
                                <th>Name</th>
                                <th>Gender</th>
                                <th>Age</th>
                                <th>Barangay</th>
                                <th>Case</th>
                                <th>Intake Form</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Rhodjien Caratao</td>
                                    <td>Female</td>
                                    <td>21</td>
                                    <td>Marigondon</td>
                                    <td>Physical Abuse</td>
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