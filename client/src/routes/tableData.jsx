import './tableData.css';
import 'bootstrap/dist/css/bootstrap.min.css';
 
function TableData({data}) { 
    return (
        <div style={{ paddingLeft: "2rem", paddingRight: "2rem" }} >
            {data.length ? <h4 style={{ paddingTop: "2rem"}} className="mb-3">Response in JSON</h4> : <></>}
            <div>
                {data.length ? <tr>
                    <th>Location Id</th>
                    <th>Email Sent</th>
                    <th>Blocked</th>
                    <th>Booked</th>
                    <th>Enabled</th>
                    <th>User Id</th>
                    <th>User last location Id</th>
                    <th>Created At</th>
                    <th>Last Updated</th>
                </tr> : <></>}
                {data.map((item, i) => (
                    <tr key={i}>
                        <td>{item.id ? item.id : item._id}</td>
                        <td>{item.emailSent ? "true" : "false"}</td>
                        <td>{item.isBlocked ? "true" : "false"}</td>
                        <td>{item.isBooked ? "true" : "false"}</td>
                        <td>{item.isEnabled ? "true" : "false"}</td>
                        <td>{item.user.id}</td>
                        <td>{item.user.last_location}</td>
                        <td>{item.created ? item.created : 'N/A'}</td>
                        <td>{item.lastUpdated ? item.lastUpdated : 'N/A'}</td>
                    </tr>
                ))}
            </div>
        </div>
    );
}
 
export default TableData;