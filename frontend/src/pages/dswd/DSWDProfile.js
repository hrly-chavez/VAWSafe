import Navbar from './Navbar.js';
import './DSWDProfileCSS.css';

export default function DeskOfficerProfile () {
    const sidebarItems = [
        { icon: '/images/dashboard.png', label: 'Dashboard' },
        { icon: '/images/hands.png', label: 'VAWC Victims' },
        { icon: '/images/user.png', label: 'Social Workers' },
        { icon: '/images/edit.png', label: 'Case Records' },
        { icon: '/images/high-value.png', label: 'Services' },
        { icon: '/images/bell.png', label: 'Notification' },
        { icon: '/images/tools.png', label: 'File Maintenance' },
    ];

    return (
        <>
            <Navbar />
            <div className='sidebar'>
                <div className='profile'>
                    <img src='/images/bussiness-man.png' className='pfp'></img>
                    <div className='profile-title-container'>
                        <h1 className='profile-title'>DSWD OFFICER</h1>
                    </div>
                    
                </div>

                <div className='choices'>
                    {sidebarItems.map((item, index) => (
                        <div className='row' key={index}>
                        <img src={item.icon} className='dashboard-icons' alt={item.label} />
                        <p>{item.label}</p>
                        </div>
                    ))}
                </div>
                
            </div>
        </>
        
    );
}