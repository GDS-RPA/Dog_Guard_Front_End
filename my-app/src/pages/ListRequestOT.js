import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../components/Navbar';
import HeaderLeader from '../components/HeaderLeader';
import axios from 'axios';
import { FaTrash, FaSearch, FaSort } from 'react-icons/fa';
import ReactPaginate from 'react-paginate';
import '../assets/RequestOTManage.css?v=2';

const RequestOt = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const decodedToken = jwtDecode(token);
    const userName = decodedToken?.leader;

    const [showExportPopup, setShowExportPopup] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortOrder, setSortOrder] = useState({
        startTime: 'asc', // Default sort for startTimeOt
        endTime: 'asc',   // Default sort for endTimeOt
    });
    const [monthYear, setMonthYear] = useState("");
    const [filePath, setFilePath] = useState("");


    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://118.70.127.173:8000/overtime/leader', {
                leader: decodedToken.leader
            });
            setData(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        } finally {
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
            item.status === "Approved" &&
            (
                (item.account?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (item.startTimeOt?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (item.endTimeOt?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (item.status?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (item.leader?.toLowerCase() || '').includes(searchQuery.toLowerCase())
            )
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

    const handleSort = (column) => {
        const newSortOrder = { ...sortOrder };
        const newOrder = newSortOrder[column] === 'asc' ? 'desc' : 'asc';
        newSortOrder[column] = newOrder;
        setSortOrder(newSortOrder);

        const sortedData = [...data].sort((a, b) => {
            const valA = column === 'startTime' ? new Date(a.startTimeOt) : new Date(a.endTimeOt);
            const valB = column === 'startTime' ? new Date(b.startTimeOt) : new Date(b.endTimeOt);
            return newOrder === 'asc' ? valA - valB : valB - valA;
        });

        setData(sortedData);
    };

    const parseDateTime = (dateTimeString) => {
        const [datePart, timePart] = dateTimeString.split(' ');
        const [year, month, day] = datePart.split('-');
        const [hours, minutes, seconds] = timePart.split(':');
        return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    // const calculateTimeOtAndManDay = (startTimeStr, endTimeStr) => {
    //     const startTime = parseDateTime(startTimeStr);
    //     const endTime = parseDateTime(endTimeStr);
    //     const timeOtInHours = (endTime - startTime) / (1000 * 60 * 60);
    //     const manDay = timeOtInHours / 8;
    //     return {
    //         timeOtInHours: timeOtInHours.toFixed(2),
    //         manDay: manDay.toFixed(2),
    //     };
    // };


    const calculateTimeOtAndManDay = (startTimeStr, endTimeStr) => {
        const startTime = parseDateTime(startTimeStr);
        const endTime = parseDateTime(endTimeStr);
    
        let timeOtInHours = (endTime - startTime) / (1000 * 60 * 60);
    
        // Xác định khoảng nghỉ trưa (12:00 - 13:00)
        const lunchStart = new Date(startTime);
        lunchStart.setHours(12, 0, 0, 0);
        
        const lunchEnd = new Date(startTime);
        lunchEnd.setHours(13, 0, 0, 0);
    
        // Kiểm tra thời gian bị chồng lấn với khoảng nghỉ trưa
        if (startTime < lunchEnd && endTime > lunchStart) {
            const overlapStart = Math.max(startTime, lunchStart); // Bắt đầu khoảng trùng
            const overlapEnd = Math.min(endTime, lunchEnd); // Kết thúc khoảng trùng
            const overlapHours = (overlapEnd - overlapStart) / (1000 * 60 * 60);
            timeOtInHours -= overlapHours; // Trừ đi đúng khoảng thời gian bị trùng
        }
    
        const manDay = timeOtInHours / 8;
    
        return {
            timeOtInHours: timeOtInHours.toFixed(2),
            manDay: manDay.toFixed(2),
        };
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này không?')) {
            try {
                await axios.delete(`http://118.70.127.173:8000/overtime/${id}/delete`);
                alert('Xóa thành công!');
                fetchData();
            } catch (error) {
                console.error('Lỗi khi xóa:', error);
                alert('Xóa thất bại!');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    const handleExportClick = () => {
        setShowExportPopup(true);
    };

    const handleCancel = () => {
        setShowExportPopup(false);
    };

    const handlePickFolder = async () => {
        try {
            const dirHandle = await window.showDirectoryPicker();
            setFilePath(dirHandle.filePath);
        } catch (error) {
            console.error("Lỗi khi chọn thư mục:", error);
        }
    };

    const handleExport = async () => {
        if (!monthYear) {
            alert("Vui lòng chọn tháng/năm!");
            return;
        }

        const [year, month] = monthYear.split("-"); // Tách tháng và năm từ input
        const leader = decodedToken.leader; // Lấy leader từ token

        try {
            // Gọi API export file
            const monthNumber = parseInt(month, 10); 
            const response = await fetch(`http://118.70.127.173:8000/overtime/export?month=${monthNumber}&year=${year}&leader=${leader}`);
            console.log("File URL:", response);

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const fileUrl = await response.text();
            console.log("File URL:", fileUrl);

            // Tải xuống file từ API download
            const downloadResponse = await fetch(`http://118.70.127.173:8000${fileUrl}`);
            if (!downloadResponse.ok) {
                throw new Error("Không thể tải file về.");
            }

            // Chuyển dữ liệu thành blob và tạo link download
            const blob = await downloadResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileUrl.split("/").pop(); // Lấy tên file từ URL
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            alert("Xuất file thành công!");
            setShowExportPopup(false); // Đóng popup
        } catch (error) {
            console.error("Lỗi xuất file:", error);
            alert("Lỗi xuất file: " + error.message);
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
                                        <th>STT</th>
                                        <th>Account</th>
                                        <th onClick={() => handleSort('startTime')}>
                                            Start Time Ot <FaSort />
                                        </th>
                                        <th onClick={() => handleSort('endTime')}>
                                            End Time OT <FaSort />
                                        </th>
                                        <th>Time OT</th>
                                        <th>Man-day</th>
                                        <th>Leader</th>
                                        <th>Note</th>
                                        <th>Status</th>
                                        <th>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((item, index) => {
                                        const { timeOtInHours, manDay } = calculateTimeOtAndManDay(item.startTimeOt, item.endTimeOt);
                                        return (
                                            <tr key={item.id}>
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
                                                    <button
                                                        style={{ background: 'red' }}
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className='pagination-acc' style={{ marginTop: "0%" }}>
                                <button style={{ background: 'blue', color: 'white', marginBottom: '30px', marginTop: "25px" }} onClick={handleExportClick}>
                                    Export Excel
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

                            {showExportPopup && (
                                <div className="popup">
                                    <div className="popup-content">
                                        <div className="popup-header">
                                            <h3>Chọn thông tin xuất Excel</h3>
                                        </div>
                                        <div className="popup-body">
                                            <label>
                                                Chọn tháng/năm:
                                                <input
                                                    type="month"
                                                    value={monthYear}
                                                    onChange={(e) => setMonthYear(e.target.value)}
                                                />
                                            </label>
                                        </div>
                                        <div className="popup-footer">
                                            <button className='exportButton' onClick={handleExport}>Export</button>
                                            <button className='cancelButton' onClick={handleCancel}>Cancel</button>
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

export default RequestOt;
