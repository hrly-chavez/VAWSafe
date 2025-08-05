import Navbar from "./Navbar";
import Sidebar from "./sidebar";
import './css/DSWDNotification.css';

export default function DSWDNotification () {
    return (
        <>
            <Navbar />

            <div className="main-container">
                <Sidebar />

                <div className="inside-container">
                    <h2 className="notification">Notifications</h2>

                    <p className="list-text">Notification Alerts</p>

                    <div className="table-container">
                        <table className="table-notification">
                            <thead>
                                <th>Victim No.</th>
                                <th>Victim Name</th>
                                <th>Time</th>
                                <th>Date</th>
                                <th>Track Location</th>
                                <th>Map View</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Rhodjien Caratao</td>
                                    <td>9:30 am</td>
                                    <td>7/5/2025</td>
                                    <td style={{opacity: 0.5}}>Live Location Off</td>
                                    <td style={{opacity: 0.5}}>None</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
        
    );
}