import '../assets/Login.css';
import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput
} from 'mdb-react-ui-kit';

function App() {
  // State để lưu giá trị email, password và token
  const [mail, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  let navigate = useNavigate();

  const handleLogin = async () => {
    const data = { mail: mail, password: password };
    try {
        const response = await fetch('http://118.70.127.173:8000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            if (result.access_token.split('.').length !== 3) {
                throw new Error("Invalid token format");
            }

            const token = result.access_token;
            setToken(token); 
            localStorage.setItem('access_token', token);

            const decodedToken = jwtDecode(token); 
            const { leader, role } = decodedToken; // Giả sử token chứa thông tin `role`

            console.log("sub = ", leader);
            console.log("role = ", role);

            // Điều hướng dựa trên quyền
            if (role === 'admin') {
                navigate('/admin/management-user'); // Hoặc trang admin mặc định
            } else {
                navigate(`/leader/${leader}`);
            }
            window.location.reload();
        } else {
            alert('Invalid credentials');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
};
  return (
    <MDBContainer className="my-5 gradient-form">
      <MDBRow>
        <MDBCol col='6' className="mb-5">
          <div className="d-flex flex-column ms-5">
            <div className="text-center">
              <img src={`${process.env.PUBLIC_URL}/GDS 1.png`}
                   style={{width: '240px'}} alt="logo" />
              <h4 className="mt-1 mb-5 pb-1">Dogguard Web Site</h4>
            </div>

            <p>Please login to your account</p>

            <MDBInput
              wrapperClass='mb-4'
              label='Account'
              id='form1'
              type='mail'
              value={mail}
              onChange={(e) => setEmail(e.target.value)}
            />
            <MDBInput
              wrapperClass='mb-4'
              label='Password'
              id='form2'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="text-center pt-1 mb-5 pb-1">
              <MDBBtn
                className="mb-4 w-100 gradient-custom-2"
                onClick={handleLogin}
              >
                Sign in
              </MDBBtn>
              {/* <a className="text-muted" href="#!">Forgot password?</a> */}
            </div>
          </div>
        </MDBCol>

        <MDBCol col='6' className="mb-5">
          <div className="d-flex flex-column justify-content-center gradient-custom-2 h-100 mb-4">
            <div className="text-white px-3 py-4 p-md-5 mx-md-4">
              <h4 className="mb-4">We are more than just a company</h4>
              <p className="small mb-0">Lorem ipsum dolor sit amet, consectetur adipisicing elit...</p>
            </div>
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default App;
