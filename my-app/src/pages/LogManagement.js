import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { FaTrash, FaEdit, FaSearch, FaTrashRestoreAlt } from 'react-icons/fa'; // Import icon
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
    const [selectedIds, setSelectedIds] = useState([]); // State lưu các ID được tích
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

    // State cho popup edit
    const [showPopup, setShowPopup] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null); // Bản ghi đang chỉnh sửa
    const [itemsPerPage, setItemsPerPage] = useState(15); // State lưu số bản ghi hiển thị

    useEffect(() => {

        const fetchData = async () => {
            try {
                // const decodedToken = jwtDecode(token);
                const response = await axios.get('http://118.70.127.173:8000/log/log_request/all', {

                });
                setData(response.data);
                setLoading(false);
                console.log("response.data : ", response.data);

            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const handleDeleteClick = async (id) => {
        const confirmDelete = window.confirm('Đồng ý xóa dòng id =  ' + id);
        if (confirmDelete) {
            try {
                await axios.delete(`http://118.70.127.173:8000/log/${id}/delete`);
                setData(data.filter((item) => item.id !== id));
                alert('Xóa thành công dòng có ID = ', id);
            } catch (error) {
                console.error('Error deleting record:', error);
                alert('xóa thất bại.');
            }
        }
    };

    const handleDeleteAll = async (mac) => {
        const confirmDelete = window.confirm('Xóa tất cả bản ghi có Mac = ' + mac);
        if (confirmDelete) {
            try {
                await axios.delete(`http://118.70.127.173:8000/log/deleteAll`, {
                    params: { mac },
                });
                alert('Xóa thành công');
            } catch (error) {
                console.error('Error deleting record:', error);
                alert('xóa thất bại.');
            }
        }
    };

    const filteredData = data.filter((item) => {
        return (
            item.mac.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.timeLog.toLowerCase().includes(searchQuery.toLowerCase())
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

    const handleCheckboxChange = (id) => {
        setSelectedIds((prevSelectedIds) =>
            prevSelectedIds.includes(id)
                ? prevSelectedIds.filter((item) => item !== id) // Bỏ chọn
                : [...prevSelectedIds, id] // Thêm vào danh sách
        );
    };

    const handleSelectAll = (isChecked) => {
        const currentPageIds = currentData.map((item) => item.id);

        if (isChecked) {
            // Thêm các ID của trang hiện tại vào danh sách
            setSelectedIds((prevSelectedIds) => [...new Set([...prevSelectedIds, ...currentPageIds])]);
        } else {
            // Xóa các ID của trang hiện tại khỏi danh sách
            setSelectedIds((prevSelectedIds) => prevSelectedIds.filter((id) => !currentPageIds.includes(id)));
        }
    };

    const deleteSelectedLogs = async (ids) => {
        if (ids.length === 1) {
            const confirmDelete = window.confirm(`Đồng ý xóa dòng có ID = ${ids[0]}?`);
            if (confirmDelete) {
                try {
                    await axios.delete(`http://118.70.127.173:8000/log/${ids[0]}/delete`);
                    setData((prevData) => prevData.filter((item) => item.id !== ids[0]));
                    alert(`Xóa thành công dòng có ID = ${ids[0]}`);
                } catch (error) {
                    console.error('Error deleting record:', error);
                    alert('Xóa thất bại.');
                }
            }
        } else {
            try {
                const response = await axios.delete('http://118.70.127.173:8000/log/list/deleteAll', {
                    data: ids,
                    headers: {
                        'Content-Type': 'application/json', // Đảm bảo tiêu đề Content-Type là JSON
                    },
                });
                setData((prevData) => prevData.filter((item) => !ids.includes(item.id)));
                alert('Xóa thành công các dòng được chọn.');
                return response.data; // Trả về dữ liệu nếu cần
            } catch (error) {
                console.error('Error deleting selected logs:', error);
                alert('Xóa thất bại.');
                throw error; // Ném lỗi để xử lý ở chỗ gọi hàm
            }
        }
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
                        <div style={{ marginBottom: '10px' }}>
                            <button
                                style={{
                                    background: selectedIds.length > 0 ? 'red' : '#ccc',
                                    color: 'white',
                                    padding: '10px',
                                    border: 'none',
                                    cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed',
                                }}
                                disabled={selectedIds.length === 0}
                                onClick={async () => {
                                    console.log("list ID : ", selectedIds);
                                    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa các bản ghi đã chọn?');
                                    if (confirmDelete) {
                                        try {
                                            await deleteSelectedLogs(selectedIds);
                                            setData(data.filter((item) => !selectedIds.includes(item.id)));
                                            setSelectedIds([]); // Xóa hết các ID đã chọn khỏi danh sách
                                            alert('Xóa thành công các bản ghi đã chọn.');
                                        } catch (error) {
                                            alert('Xóa thất bại.');
                                        }
                                    }
                                }}
                            >
                                Delete
                            </button>

                        </div>

                        <div className="search-container-log">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input-acc"
                            />
                            <FaSearch className="search-icon-admin" />  {/* Font Awesome search icon */}
                        </div>

                    </div>

                    {loading ? (
                        <p>Loading data...</p>
                    ) : (
                        <div>
                            <table className="leader-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                checked={
                                                    currentData.length > 0 &&
                                                    currentData.every((item) => selectedIds.includes(item.id))
                                                }
                                            />
                                        </th>
                                        {/* <th>ID</th> */}
                                        <th>STT</th>
                                        <th>Mac</th>
                                        <th>Status</th>
                                        <th>Time Log</th>
                                        <th>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => handleCheckboxChange(item.id)}
                                                />
                                            </td>
                                            {/* <td>{item.id}</td> */}
                                            <td>{index + 1}</td>
                                            <td>{item.mac}</td>
                                            <td>{item.status}</td>
                                            <td>{item.timeLog}</td>
                                            <td>
                                                <div className="button-container">
                                                    {/* <button style={{ background: 'red' }} onClick={() => handleDeleteClick(item.id)}>
                                                        <FaTrash />
                                                    </button> */}
                                                    <button style={{ background: 'red' }} onClick={() => handleDeleteAll(item.mac)}>
                                                        <FaTrashRestoreAlt />
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
                        </div>
                    )}
                </main>
            </div>
        </div>
    );


};

export default LeaderPage;
