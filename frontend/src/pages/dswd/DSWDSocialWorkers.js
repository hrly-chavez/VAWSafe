import Navbar from "./Navbar";
import Sidebar from "./sidebar";
import './css/DSWDSocialWorker.css';

export default function DSWDSocialWorkers () {
    return (
        <>
            <Navbar />

            <div className="main-container">
                <Sidebar />

                <div className="inside-container">
                    <h2 className="socialworker">Social Workers</h2>

                    <p className="list-text">List of Social Workers</p>

                    <div className="search-add">
                        <div className="search">
                                <input type="text" value="Search" className="searchbar"></input>
                                <img src="./images/loupe.png"></img>
                        </div>

                        <button className="add-button">
                            <img src="./images/add (1).png" className="icon"></img>
                            Add
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="table-socialworker">
                            <thead>
                                <th>Name</th>
                                <th>Position</th>
                                <th>Contact Number</th>
                                <th>Email Address</th>
                                <th>Status</th>
                                <th>Forms</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Rhodjien Caratao</td>
                                    <td>DSWD Social Worker</td>
                                    <td>+63 905 327 3129</td>
                                    <td>carataojoegie@gmail.com</td>
                                    <td>Active</td>
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