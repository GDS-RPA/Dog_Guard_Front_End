import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
// import '../assets/Leader.css';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { FaTrash, FaEdit, FaSearch } from 'react-icons/fa'; // Import icon
import Navbar from '../components/NavbarAdmin';
import HeaderLeader from '../components/HeaderAdmin';

const LeaderPage = () => {
    const { token } = useContext(AuthContext);
    const { sub } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [defaultRecord, setDefaultRecord] = useState(null); // Lưu giá trị mặc định
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    // const itemsPerPage = 15;
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [newAccount, setNewAccount] = useState({
        leader: '',
        mail: '',
        password: ''
    });
    const decodedToken = jwtDecode(token);
    const userName = decodedToken?.leader

    // State cho popup edit
    const [showPopup, setShowPopup] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null); // Bản ghi đang chỉnh sửa
    const [itemsPerPage, setItemsPerPage] = useState(15); // State lưu số bản ghi hiển thị

    useEffect(() => {

        const fetchData = async () => {
            try {
                // const decodedToken = jwtDecode(token);
                const response = await axios.get('http://118.70.127.173:8000/leader-info/all', {

                });
                setData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const handleCreateClick = () => {
        setNewAccount({
            leader: '',
            mail: '',
            password: ''
        }); // Reset form tạo tài khoản
        setShowCreatePopup(true); // Hiển thị popup tạo tài khoản
    };


    const handleDeleteClick = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this record?');
        if (confirmDelete) {
            try {
                await axios.delete(`http://118.70.127.173:8000/leader-info/${id}/delete`);
                setData(data.filter((item) => item.id !== id));
                alert('Record deleted successfully!');
            } catch (error) {
                console.error('Error deleting record:', error);
                alert('Failed to delete record.');
            }
        }
    };

    const filteredData = data.filter((item) => {
        return (
            item.leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.mail.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const pageCount = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');

        navigate('/login');
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value)); // Cập nhật số bản ghi
        setCurrentPage(0); // Reset về trang đầu tiên
    };

    const handleInputChangeCreate = (e) => {
        const { name, value } = e.target;
        setNewAccount({ ...newAccount, [name]: value });
    };

    const handleCreateSave = async () => {
        console.log("parameter : ", newAccount);
        try {
            // Gửi yêu cầu tạo tài khoản
            const response = await axios.post('http://118.70.127.173:8000/auth/register', newAccount);
            console.log("parameter : ", newAccount);


            if (response.status === 201) {
                alert('Account created successfully');
                setData([...data, newAccount]); // Thêm tài khoản mới vào danh sách
                setShowCreatePopup(false); // Đóng popup
            }
        } catch (error) {
            console.error('Lỗi khi tạo tài khoản:', error);
            alert('Error creating account. Please try again.');
        }
    };

    // Cập nhật các hàm liên quan
    const handleEditClick = (record) => {
        setCurrentRecord(record); // Lưu bản ghi hiện tại để chỉnh sửa
        setDefaultRecord(record); // Lưu giá trị mặc định
        setShowPopup(true); // Hiển thị popup
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(
                `http://118.70.127.173:8000/leader-info/${currentRecord.id}/update`,
                currentRecord
            );
            if (response.status === 200) {
                alert('Record updated successfully!');
                // Cập nhật dữ liệu trong danh sách
                const updatedData = data.map((item) =>
                    item.id === currentRecord.id ? currentRecord : item
                );
                setData(updatedData);
                setShowPopup(false); // Đóng popup
            }
        } catch (error) {
            console.error('Error updating record:', error);
            alert('Failed to update record. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const element = e.target;

        if (value !== defaultRecord[name]) {
            element.classList.add('changed'); // Thêm class để đổi màu
        } else {
            element.classList.remove('changed');
        }

        setCurrentRecord({ ...currentRecord, [name]: value });
    };

    const styles = {
        container: {
            display: 'flex',
            height: '100vh',
        },
        sidebar: {
            width: '240px',
            position: 'fixed',
            height: '100%',
            top: '64px',  // Đẩy xuống dưới header
            left: 0,
            backgroundColor: '#fff',
            boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
        },
        mainContent: {
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            marginLeft: '240px',
        },
        header: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '64px',
            backgroundColor: '#282c34',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1100,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
        main: {
            marginTop: '64px',  // Để tránh header che nội dung
            padding: '20px',
            minHeight: 'calc(100vh - 64px)',  // Tính toán để tránh tràn dưới Header
        },
    };

    return (

        <div style={styles.container}>
            <div style={styles.sidebar}>
                <Navbar />
            </div>
            <div style={styles.mainContent}>
                <div style={styles.header}>
                    <HeaderLeader userName={userName} onLogout={handleLogout} />
                </div>
                <main style={styles.main}>
                    <div className='searchADDLeader'>
                        <div className='addAccount'>
                            <button
                                style={{
                                    backgroundColor: 'green',
                                    color: 'white',
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    marginBottom: '20px',
                                    cursor: 'pointer'
                                }}
                                onClick={handleCreateClick}
                            >
                                + Tạo mới Leader
                            </button>
                        </div>

                        <div className="search-container-acc">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input-acc"
                            />
                            <FaSearch className="search-icon" />  {/* Font Awesome search icon */}
                        </div>

                    </div>

                    {loading ? (
                        <p>Loading data...</p>
                    ) : (
                        <div>
                            <table className="leader-table">
                                <thead>
                                    <tr>
                                        {/* <th>ID</th> */}
                                        <th>STT</th>
                                        <th>Leader</th>
                                        <th>EMail</th>
                                        <th>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((item, index) => (
                                        <tr key={item.id}>
                                            {/* <td>{item.id}</td> */}
                                            <td>{index + 1}</td>
                                            <td>{item.leader}</td>
                                            <td>{item.mail}</td>
                                            <td>
                                                <div className="button-container">
                                                    <button onClick={() => handleEditClick(item)}>
                                                        <FaEdit />
                                                    </button>
                                                    <button style={{ background: 'red' }} onClick={() => handleDeleteClick(item.id)}>
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {showCreatePopup && (
                                <div className="popup">
                                    <div className="popup-content">
                                        <div className="popup-header">
                                            <h3>Create New Account Leader</h3>
                                        </div>
                                        <div className="popup-body">
                                            <label>
                                                Leader Name:
                                                <input
                                                    type="text"
                                                    name="leader"
                                                    value={newAccount.leader}
                                                    onChange={handleInputChangeCreate}
                                                />
                                            </label>
                                            <label>
                                                Email:
                                                <input
                                                    type="text"
                                                    name="mail"
                                                    value={newAccount.mail}
                                                    onChange={handleInputChangeCreate}
                                                />
                                            </label>
                                            <label>
                                                Password:
                                                <input
                                                    type="text"
                                                    name="password"
                                                    value={newAccount.password}
                                                    onChange={handleInputChangeCreate}
                                                />
                                            </label>
                                        </div>
                                        <div className="popup-footer">
                                            <button className='saveUpdate' onClick={handleCreateSave}>Save</button>
                                            <button className='cancelUpdate' onClick={() => setShowCreatePopup(false)}>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className='pagination-acc'>
                                <div className="select-container-acc">
                                    {/* <label htmlFor="itemsPerPage">Số bản ghi hiển thị:</label> */}
                                    <select
                                        id="itemsPerPage"
                                        value={itemsPerPage}
                                        onChange={handleItemsPerPageChange}
                                    >
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="15">15</option>
                                        <option value="20">20</option>
                                    </select>
                                </div>
                                <ReactPaginate
                                    previousLabel={'«'}
                                    nextLabel={'»'}
                                    // breakLabel={'...'}
                                    pageCount={pageCount}
                                    marginPagesDisplayed={0}
                                    pageRangeDisplayed={2}
                                    onPageChange={handlePageClick}
                                    containerClassName={'pagination'}
                                    activeClassName={'active'}
                                    pageClassName={'page-item'}
                                    pageLinkClassName={'page-link'}
                                    previousClassName={'page-item'}
                                    previousLinkClassName={'page-link'}
                                    nextClassName={'page-item'}
                                    nextLinkClassName={'page-link'}
                                    breakClassName={'page-item'}
                                    breakLinkClassName={'page-link'}
                                />

                                {showPopup && (
                                    <div className="popup">
                                        <div className="popup-content">
                                            <div className="popup-header">
                                                <h3>Edit Leader Info</h3>
                                            </div>
                                            <div className="popup-body">
                                                <label>
                                                    Leader:
                                                    <input
                                                        type="text"
                                                        name="leader"
                                                        value={currentRecord.leader}
                                                        onChange={handleInputChange}
                                                    />
                                                </label>
                                                <label>
                                                    Email:
                                                    <input
                                                        type="text"
                                                        name="mail"
                                                        value={currentRecord.mail}
                                                        onChange={handleInputChange}
                                                    />
                                                </label>
                                                <label>
                                                    Password(đã được mã hóa):
                                                    <input
                                                        type="text"
                                                        name="password"
                                                        value={currentRecord.password}
                                                        onChange={handleInputChange}
                                                    />
                                                </label>
                                            </div>
                                            <div className="popup-footer">
                                                <button className="saveUpdate" onClick={handleSave}>
                                                    Save
                                                </button>
                                                <button
                                                    className="cancelUpdate"
                                                    onClick={() => setShowPopup(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                        </div>
                    )}
                </main>
            </div>
        </div>
    );


};

export default LeaderPage;
