// import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <header>
      <div className="p-5 text-center bg-light">
        <h1 className="mb-3">42 Seat Selector</h1>
        <h4 className="mb-3">Sign in with intra</h4>
        <a className="btn btn-primary" href="#" onClick={buttonClicked} role="button">Sign In</a>
      </div>
    </header>
  );
}