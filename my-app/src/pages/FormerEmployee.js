import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../components/Navbar';
import HeaderLeader from '../components/HeaderLeader';
import axios from 'axios';
import { FaTrash, FaSearch } from 'react-icons/fa';
import ReactPaginate from 'react-paginate';
import '../assets/RequestOTManage.css?v=2';

const RequestOt = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const decodedToken = jwtDecode(token);
    const userName = decodedToken?.leader;

    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // await axios.get('http://118.70.127.173:8000/log/start_scheduler/check');
                // console.log('Scheduler check API called successfully.');

                const data = await axios.post('http://118.70.127.173:8000/log/start_scheduler');
                console.log('API Response:', data.data);

                const response = await axios.get('http://118.70.127.173:8000/former-employees/get/leader');
                const filteredData = response.data.filter(item => item.leader === userName);

                setData(filteredData);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const filteredData = data.filter((item) => {
        return (
            (item.formerEmployee.account?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.formerEmployee.status?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.formerEmployee.mac?.toLowerCase() || '').includes(searchQuery.toLowerCase())
            // (item.leader?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        );
    });

    const pageCount = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(0);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    const handleDeleteClick = async (mac) => {
        const confirmDelete = window.confirm('Xóa tất cả bản ghi có Mac = ' + mac);
        if (confirmDelete) {
            try {
                await axios.delete(`http://118.70.127.173:8000/log/deleteAll`, {
                    params: { mac },
                });
                alert('Xóa thành công');

                // tải lại dữ liệu sau khi xóa thành công
                const response = await axios.get('http://118.70.127.173:8000/former-employees/get/leader');
                const filteredData = response.data.filter(item => item.leader === userName);

                // Cập nhật lại dữ liệu sau khi lọc
                setData(filteredData);
            } catch (error) {
                console.error('Error deleting record:', error);
                alert('xóa thất bại.');
            }
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ width: '240px', position: 'fixed', height: '100%', backgroundColor: '#fff' }}>
                <Navbar />
            </div>
            <div style={{ flexGrow: 1, marginLeft: '240px' }}>
                <HeaderLeader userName={userName} onLogout={handleLogout} />
                <main style={{ marginTop: '64px', padding: '20px' }}>
                    <div className="searchADD">
                        <div className="select-container">
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
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            <FaSearch className="search-icon" />
                        </div>
                    </div>

                    {loading ? (
                        <p>Loading data...</p>
                    ) : (
                        <div>

                            <table className="ListRequestOT-table">

                                <thead>
                                    <tr>
                                        {/* <th>ID</th> */}
                                        <th>STT</th>
                                        <th>Mac</th>
                                        <th>Account</th>
                                        <th>Status</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>leader</th>
                                        <th>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((item , index) => (
                                        <tr key={item.id}>
                                            {/* <td>{item.formerEmployee.id}</td> */}
                                            <td>{index + 1}</td>
                                            <td>{item.formerEmployee.mac}</td>
                                            <td>{item.formerEmployee.account}</td>
                                            <td>{item.formerEmployee.status}</td>
                                            <td>{item.formerEmployee.startDate}</td>
                                            <td>{item.formerEmployee.endDate}</td>
                                            <td>{item.leader}</td>
                                            <td>
                                                <div className="button-container">
                                                    <button style={{ background: 'red' }} onClick={() => handleDeleteClick(item.formerEmployee.mac)}>
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                    )}
                </main>
            </div>
        </div>
    );
};

export default RequestOt;
