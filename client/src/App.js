import './App.css';
import { Link } from "react-router-dom";

export default function App() {

  // const [backendData, setBackendData] = useState([{}]);

  // useEffect(() => {
  //   fetch("/about").then(response => {
  //     response.json();
  //   }).then(
  //     data => {
  //       setBackendData(data)
  //     }
  //   )
  // }, []);

  function buttonClicked() {
    window.open(
      'https://api.intra.42.fr/oauth/authorize?client_id=5cbe72a1c8aab70b68c163b9c626094122fba7f32cb0431fb6983da375e5e67e&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth&response_type=code',
      '_self',
      'noopener,noreferrer'
    );
  }

  return (
    <div>
      <h1>42 Seat Selector</h1>
      <nav
        style={{
          borderBottom: "solid 1px",
          paddingBottom: "1rem",
        }}
      >
        <Link to="/home">Home</Link> |{" "}
        <Link to="/edit-seats">Edit Seats</Link>
      </nav>
      <button onClick={buttonClicked}>
        Sign In
      </button>
      {/* {(typeof backendData.name === 'undefined') ? (
        <p>Loading...</p>
      ) : ( */}
        {/* <div>
          <p key='0'>{backendData.name}</p>
          <p key='1'>{backendData.version}</p>
        </div> */}
      {/* )} */}
    </div>
  );
}