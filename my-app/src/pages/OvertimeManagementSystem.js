import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../components/Navbar';
import HeaderLeader from '../components/HeaderLeader';
import axios from 'axios';
import { FaTrash, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
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

    const fetchData = async () => {
        try {
            const response = await axios.post('http://118.70.127.173:8000/overtime/leader', {
                leader: decodedToken.leader,
            });
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const filteredData = data.filter((item) => {
        return (
            item.status === 'Pending' &&
            ((item.account?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (item.startTimeOt?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (item.endTimeOt?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (item.status?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (item.leader?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
        );
    });

    const pageCount = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage,
    );

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(0);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    const handleApprove = async (id) => {
        try {
            await axios.put(`http://118.70.127.173:8000/overtime/${id}/update-status`);
            alert('Record approved successfully.');
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to approve the record.');
        }
    };

    const handleApproveAll = async () => {
        try {
            await axios.put('http://118.70.127.173:8000/overtime/update-status/all', {
                leader: decodedToken.leader,
            });
            alert('All records approved successfully.');
            fetchData();
        } catch (error) {
            console.error('Error approving all records:', error);
            alert('Failed to approve all records.');
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Reject request OT này');
        if (confirmDelete) {
            try {
                await axios.delete(`http://118.70.127.173:8000/overtime/${id}/delete`);
                alert('Reject thành công');
                fetchData();
            } catch (error) {
                console.error('Error updating status:', error);
                alert('Reject thất bại');
            }
        }
    };

    const parseDateTime = (dateTimeString) => {
        const [datePart, timePart] = dateTimeString.split(' ');
        const [year, month, day] = datePart.split('-');
        const [hours, minutes, seconds] = timePart.split(':');
        return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    const calculateTimeOtAndManDay = (startTimeStr, endTimeStr) => {
        const startTime = parseDateTime(startTimeStr);
        const endTime = parseDateTime(endTimeStr);
        const timeOtInHours = (endTime - startTime) / (1000 * 60 * 60);
        const manDay = timeOtInHours / 8;
        return {
            timeOtInHours: timeOtInHours.toFixed(2),
            manDay: manDay.toFixed(2),
        };
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
                            <select id="itemsPerPage" value={itemsPerPage} onChange={handleItemsPerPageChange}>
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
                                        <th>Account</th>
                                        <th>Start Time OT</th>
                                        <th>End Time OT</th>
                                        <th>Time OT</th>
                                        <th>Man-day</th>
                                        <th>Leader</th>
                                        <th>Note</th>
                                        <th>Status</th>
                                        <th>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((item, index) => {
                                        const { timeOtInHours, manDay } = calculateTimeOtAndManDay(item.startTimeOt, item.endTimeOt);
                                        return (
                                            <tr key={item.id}>
                                                {/* <td>{item.id}</td> */}
                                                <td>{index + 1}</td>
                                                <td>{item.account}</td>
                                                <td>{item.startTimeOt}</td>
                                                <td>{item.endTimeOt}</td>
                                                <td>{timeOtInHours}</td>
                                                <td>{manDay}</td>
                                                <td>{item.leader}</td>
                                                <td>{item.note}</td>
                                                <td>{item.status}</td>
                                                <td>
                                                    <button style={{ background: 'green', marginRight: '5px' }} onClick={() => handleApprove(item.id)}>
                                                        <FaCheck />
                                                    </button>
                                                    <button style={{ background: 'red' }} onClick={() => handleDelete(item.id)}>
                                                        <FaTimes />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className='pagination-acc' style={{ marginTop: "0%" }}>
                                <button style={{ background: 'blue', color: 'white', marginBottom: '30px', marginTop: "25px" }} onClick={handleApproveAll}>
                                    Approve All
                                </button>
                                <ReactPaginate
                                    previousLabel={'«'}
                                    nextLabel={'»'}
                                    breakLabel={'...'}
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

export default RequestOt;
