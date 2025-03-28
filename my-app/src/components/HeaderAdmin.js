import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ userName, onLogout }) => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        onLogout();
        localStorage.removeItem('token');
        sessionStorage.clear()
        navigate('/login');
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleOutsideClick = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <header style={styles.header}>
            <div style={styles.logo}>
                <h2>Dog Guard</h2>
            </div>
            <div style={styles.userSection}>
                <span style={styles.userName}>{userName}</span>
                <div style={styles.dropdownContainer} ref={dropdownRef}>
                    <FaUserCircle size={32} style={styles.icon} onClick={toggleDropdown} />
                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div
                                style={styles.dropdownMenu}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div
                                    style={styles.menuItem}
                                    onClick={handleLogout}
                                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
                                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                                >
                                    Đăng xuất
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

const styles = {
    header: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: 'rgba(0, 123, 255, 0.8)', // Màu xanh dương nhẹ với độ trong suốt
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // Hiệu ứng đổ bóng
        zIndex: 1100, // Đảm bảo luôn trên nội dung
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
    },
    userName: {
        marginRight: '10px',
    },
    icon: {
        cursor: 'pointer',
    },
    dropdownContainer: {
        position: 'relative',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '50px',
        right: '0',
        backgroundColor: 'white',
        color: 'black',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '5px',
        overflow: 'hidden',
        minWidth: '150px',
        zIndex: 1200,
    },
    menuItem: {
        padding: '10px 20px',
        cursor: 'pointer',
        borderBottom: '1px solid #ddd',
    },
    logo:{
        marginLeft: '21px',
        marginTop:'8px'
    }
};

export default Header;
