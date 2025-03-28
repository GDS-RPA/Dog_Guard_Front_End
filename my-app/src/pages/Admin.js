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
    
    // State cho popup edit
    const [showPopup, setShowPopup] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null); // Bản ghi đang chỉnh sửa
    const [itemsPerPage, setItemsPerPage] = useState(15); // State lưu số bản ghi hiển thị
    const [newAccount, setNewAccount] = useState({
        id: '',
        account: '',
        type: '',
        startTime: '',
        endTime: '',
        status: '',
        dayOff: '',
        leader: ''
    });
    const decodedToken = jwtDecode(token);
    const userName = decodedToken?.leader


    useEffect(() => {

        const fetchData = async () => {
            try {
                // const decodedToken = jwtDecode(token);
                const response = await axios.get('http://118.70.127.173:8000/account/all', {
                    
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
    
    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const handleCreateClick = () => {
        setNewAccount({
            id: '',
            account: '',
            type: 'NVCT',
            startTime: '',
            endTime: '',
            status: 'UNLOCK',
            dayOff: 'Monday',
            leader: ''
        }); // Reset form tạo tài khoản
        setShowCreatePopup(true); // Hiển thị popup tạo tài khoản
    };

    const handleEditClick = (record) => {
        setCurrentRecord(record); // Lưu bản ghi cần chỉnh sửa
        setDefaultRecord(record); // Lưu giá trị mặc định để so sánh
        setShowPopup(true); // Hiển thị popup
    };

    const handleDeleteClick = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this record?');
        if (confirmDelete) {
            try {
                await axios.delete(`http://118.70.127.173:8000/account/${id}/delete`);
                setData(data.filter((item) => item.id !== id));
                alert('Record deleted successfully!');
            } catch (error) {
                console.error('Error deleting record:', error);
                alert('Failed to delete record.');
            }
        }
    };

    const handleSave = async () => {
        try {
            // Gửi dữ liệu đã chỉnh sửa lên server
            const response = await axios.put(
                `http://118.70.127.173:8000/account/${currentRecord.id}/update`,
                currentRecord // Gửi dữ liệu qua body
            );

            if (response.status === 200) {
                // Cập nhật lại dữ liệu trong state
                const updatedData = data.map((item) =>
                    item.id === currentRecord.id ? currentRecord : item
                );
                setData(updatedData);
                alert("Account updated successfully!");
                setShowPopup(false); // Đóng popup
            } else {
                alert("Failed to update account!");
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật dữ liệu:', error);
            alert('Error updating account. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const element = e.target;

        // So sánh giá trị hiện tại với giá trị mặc định
        if (value !== defaultRecord[name]) {
            element.classList.add('changed');
        } else {
            element.classList.remove('changed');
        }

        setCurrentRecord({ ...currentRecord, [name]: value });
    };

    const handleCreateSave = async () => {
        try {
            // Gửi yêu cầu tạo tài khoản
            const response = await axios.post('http://118.70.127.173:8000/account/create', newAccount);

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

    const handleInputChangeCreate = (e) => {
        const { name, value } = e.target;
        setNewAccount({ ...newAccount, [name]: value });
    };

    const filteredData = data.filter((item) => {
        return (
            item.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.leader.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const pageCount = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const handleLogout = () => {
        localStorage.removeItem('authToken');

        navigate('/login');
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value)); // Cập nhật số bản ghi
        setCurrentPage(0); // Reset về trang đầu tiên
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
            right:0,
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
                                + Tạo mới Account
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
                                        <th>STT</th>
                                        <th>Mac</th>
                                        <th>Account</th>
                                        <th>Type</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                        <th>Status</th>
                                        <th>Day Off</th>
                                        <th>Leader</th>
                                        <th>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((item,index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.id}</td>
                                            <td>{item.account}</td>
                                            <td>{item.type}</td>
                                            <td>{item.startTime}</td>
                                            <td>{item.endTime}</td>
                                            <td>{item.status}</td>
                                            <td>{item.dayOff}</td>
                                            <td>{item.leader}</td>
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
                            </div>


                            {showCreatePopup && (
                                <div className="popup">
                                    <div className="popup-content">
                                        <div className="popup-header">
                                            <h3>Create New Account</h3>
                                        </div>
                                        <div className="popup-body">
                                            <label>
                                                Mac:
                                                <input
                                                    type="text"
                                                    name="id"
                                                    value={newAccount.id}
                                                    onChange={handleInputChangeCreate}
                                                />
                                            </label>
                                            <label>
                                                Account:
                                                <input
                                                    type="text"
                                                    name="account"
                                                    value={newAccount.account}
                                                    onChange={handleInputChangeCreate}
                                                />
                                            </label>
                                            <label>
                                                Type:
                                                <select
                                                    type="text"
                                                    name="type"
                                                    value={newAccount.type}
                                                    onChange={handleInputChangeCreate}
                                                >
                                                    <option value="NVCT">NVCT</option>
                                                    <option value="Training">Training</option>
                                                    <option value="CTV">CTV</option>
                                                </select>
                                            </label>
                                            <label>
                                                Start Time:
                                                <input
                                                    type="time"
                                                    name="startTime"
                                                    value={newAccount.startTime}
                                                    onChange={handleInputChangeCreate}
                                                />
                                            </label>
                                            <label>
                                                End Time:
                                                <input
                                                    type="time"
                                                    name="endTime"
                                                    value={newAccount.endTime}
                                                    onChange={handleInputChangeCreate}
                                                />
                                            </label>
                                            <label>
                                                Status:
                                                <select
                                                    type="text"
                                                    name="status"
                                                    value={newAccount.status}
                                                    onChange={handleInputChangeCreate}
                                                >
                                                    <option value="UNLOCK">UNLOCK</option>
                                                    <option value="LOCK">LOCK</option>
                                                </select>
                                            </label>
                                            {/* <label>
                                                Day Off:
                                                <select
                                                    name="dayOff"
                                                    value={newAccount.dayOff}
                                                    onChange={handleInputChangeCreate}
                                                >
                                                    <option value="Monday">Monday</option>
                                                    <option value="Tuesday">Tuesday</option>
                                                    <option value="Wednesday">Wednesday</option>
                                                    <option value="Thursday">Thursday</option>
                                                    <option value="Friday">Friday</option>
                                                    <option value="Saturday">Saturday</option>
                                                    <option value="Sunday">Sunday</option>
                                                </select>
                                            </label> */}
                                            <label>
                                                Day Off:
                                                <input
                                                    name="dayOff"
                                                    value={newAccount.dayOff}
                                                    onChange={handleInputChangeCreate}
                                                />
                                            </label>
                                            <label>
                                                Leader:
                                                <input
                                                    type="text"
                                                    name="leader"
                                                    value={newAccount.leader}
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


                            {showPopup && (
                                <div className="popup">
                                    <div className="popup-content">
                                        <div className="popup-header">
                                            <h3>Edit Account</h3>
                                        </div>
                                        <div className="popup-body">
                                            <label>
                                                Mac:
                                                <input
                                                    type="text"
                                                    name="id"
                                                    value={currentRecord.id}
                                                    readOnly
                                                />
                                            </label>
                                            <label>
                                                Account:
                                                <input
                                                    type="text"
                                                    name="account"
                                                    value={currentRecord.account}
                                                    onChange={handleInputChange}
                                                />
                                            </label>

                                            <label>
                                                Type:
                                                <select
                                                    name="type"
                                                    value={currentRecord.type}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="NVCT">NVCT</option>
                                                    <option value="Training">Training</option>
                                                    <option value="CTV">CTV</option>
                                                </select>
                                            </label>

                                            <label>
                                                Start Time:
                                                <input
                                                    type="time"
                                                    name="startTime"
                                                    value={currentRecord.startTime}
                                                    onChange={handleInputChange}
                                                />
                                            </label>

                                            <label>
                                                End Time:
                                                <input
                                                    type="time"
                                                    name="endTime"
                                                    value={currentRecord.endTime}
                                                    onChange={handleInputChange}
                                                />
                                            </label>

                                            <label>
                                                Status:
                                                <select
                                                    type="text"
                                                    name="status"
                                                    value={currentRecord.status}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="UNLOCK">UNLOCK</option>
                                                    <option value="LOCK">LOCK</option>
                                                </select>
                                            </label>

                                            {/* <label>
                                                Day Off:
                                                <select
                                                    name="dayOff"
                                                    value={currentRecord.dayOff}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="Monday">Monday</option>
                                                    <option value="Tuesday">Tuesday</option>
                                                    <option value="Wednesday">Wednesday</option>
                                                    <option value="Thursday">Thursday</option>
                                                    <option value="Friday">Friday</option>
                                                    <option value="Saturday">Saturday</option>
                                                    <option value="Sunday">Sunday</option>
                                                </select>
                                            </label> */}
                                            <label>
                                                Day Off:
                                                <input
                                                    name="dayOff"
                                                    value={currentRecord.dayOff}
                                                    onChange={handleInputChange}
                                                    
                                                />
                                            </label>
                                            <label>
                                                Leader:
                                                <input
                                                    type="text"
                                                    name="leader"
                                                    value={currentRecord.leader}
                                                    onChange={handleInputChange}
                                                />
                                            </label>
                                        </div>
                                        <div className="popup-footer">
                                            <button className='saveUpdate' onClick={handleSave}>Save</button>
                                            <button className='cancelUpdate' onClick={() => setShowPopup(false)}>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );


};

export default LeaderPage;
