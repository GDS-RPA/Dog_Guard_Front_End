import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';

import '../assets/UserRequestOT.css';

const RequestOt = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]); 
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        account: '',
        startTime: '',
        endTime: '',
        leader: '',
        note: '',
    });

    // Lấy ngày đầu và cuối tháng hiện tại
    const getCurrentMonthRange = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const toDateTimeLocal = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        return {
            min: toDateTimeLocal(startOfMonth),
            max: toDateTimeLocal(endOfMonth)
        };
    };

    const { min, max } = getCurrentMonthRange();

    const handleChange = (selectedOption, actionMeta) => {
        if (actionMeta.name === 'account') {
            const selectedAccount = selectedOption.value;
            const selectedLeader = data.find(item => item.account === selectedAccount)?.leader || '';
            setFormData({ ...formData, account: selectedOption, leader: selectedLeader });
        } else {
            const { name, value } = actionMeta;
            setFormData((prev) => {
                const updatedData = { ...prev, [name]: value };

                // Kiểm tra điều kiện endTime phải lớn hơn startTime
                if (name === "endTime" && updatedData.startTime) {
                    if (value <= updatedData.startTime) {
                        setError("End time must be greater than Start time.");
                    } else {
                        setError("");
                    }
                }

                // Nếu startTime thay đổi, kiểm tra lại endTime
                if (name === "startTime" && updatedData.endTime) {
                    if (updatedData.endTime <= value) {
                        setError("End time must be greater than Start time.");
                    } else {
                        setError("");
                    }
                }

                return updatedData;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) {
            alert("Vui lòng sửa lỗi trước khi gửi.");
            return;
        }

        try {
            const formatTime = (time) => (time.length === 16 ? `${time}:00` : time);
            const payload = {
                account: formData.account.value,
                startTime: formatTime(formData.startTime),
                endTime: formatTime(formData.endTime),
                leader: formData.leader,
                note: formData.note,
            };

            const response = await axios.post('http://118.70.127.173:8000/overtime/create', payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            console.log('Response:', response.data);
            alert('Yêu cầu OT đã được gửi thành công!');
            setFormData({
                account: '',
                startTime: '',
                endTime: '',
                leader: '',
                note: '',
            });
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu OT:', error);
            alert('Gửi yêu cầu OT thất bại. Vui lòng thử lại.');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://118.70.127.173:8000/account/all');
                setData(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
            }
        };

        fetchData();
    }, []);

    const accountOptions = data.map((item) => ({
        value: item.account,
        label: item.account,
    }));

    return (
        <div className="request-ot-container">
            <div className="request-ot-form-wrapper">
                <h2 className="request-ot-title">Request mở máy OT</h2>
                <form onSubmit={handleSubmit}>
                    <div className="request-ot-form-group">
                        <label className="request-ot-label">Account</label>
                        <Select
                            name="account"
                            options={accountOptions}
                            isSearchable
                            onChange={(selectedOption) => handleChange(selectedOption, { name: 'account' })}
                            value={formData.account}
                            placeholder="Chọn account"
                            className="request-ot-select"
                        />
                    </div>
                    <div className="request-ot-form-group">
                        <label className="request-ot-label">Start time OT</label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={formData.startTime}
                            onChange={(e) => handleChange(e.target, e.target)}
                            className="request-ot-input"
                            min={min}
                            max={max}
                            required
                        />
                    </div>
                    <div className="request-ot-form-group">
                        <label className="request-ot-label">End time OT</label>
                        <input
                            type="datetime-local"
                            name="endTime"
                            value={formData.endTime}
                            onChange={(e) => handleChange(e.target, e.target)}
                            className={`request-ot-input ${error ? 'input-error' : ''}`}
                            min={min}
                            max={max}
                            required
                        />
                        {error && <p className="error-text">{error}</p>}
                    </div>
                    <div className="request-ot-form-group">
                        <label className="request-ot-label">Leader</label>
                        <input
                            type="text"
                            name="leader"
                            value={formData.leader}
                            readOnly
                            className="request-ot-input"
                        />
                    </div>
                    <div className="request-ot-form-group">
                        <label className="request-ot-label">Note</label>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={(e) => handleChange(e.target, e.target)}
                            className="request-ot-textarea"
                        />
                    </div>
                    <button type="submit" className="request-ot-button" disabled={error}>
                        Submit
                    </button>
                </form>
                <p className="request-ot-note">Vui lòng điền đầy đủ thông tin trước khi gửi.</p>
            </div>
        </div>
    );
};

export default RequestOt;
