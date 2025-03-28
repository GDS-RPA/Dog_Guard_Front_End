// export default Navbar;
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Collapse } from '@mui/material';
import { People, AccountCircle, RequestQuoteSharp, ExpandLess, ExpandMore, ListAlt, PlaylistAdd } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const drawerWidth = 240;

const Navbar = () => {
    const { token } = useContext(AuthContext);
    const decodedToken = jwtDecode(token);
    const navigate = useNavigate();
    const location = useLocation(); // Lấy đường dẫn hiện tại
    const [openOT, setOpenOT] = useState(false);

    const handleNavClick = (item) => {
        if (item.isReload) {
            window.location.reload();
        } else if (item.path) {
            navigate(item.path); // Điều hướng khi click vào item trong submenu
        }
    };

    const handleOTClick = () => {
        setOpenOT(!openOT); // Chỉ thay đổi trạng thái để mở/đóng submenu
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    height: '100vh',
                    marginTop: '64px'
                },
            }}
        >
            <Divider />
            <List>
                {[ 
                    { text: 'Quản Lý Tài Khoản', icon: <AccountCircle />, isReload: false, path: '/leader/' + decodedToken?.leader },
                    { text: 'Quản Lý OT', icon: <RequestQuoteSharp />, isSubmenu: true, path: '/ot' }, // Menu cấp 1 chỉ mở submenu
                    { text: 'Nhân Viên Đã Nghỉ', icon: <People />, isReload: false, path: '/former-employee/' + decodedToken?.leader },
                ].map((item) => (
                    item.isSubmenu ? (
                        <div key={item.text}>
                            <ListItem 
                                button 
                                onClick={handleOTClick} // Chỉ mở/đóng submenu
                                sx={{
                                    backgroundColor: location.pathname.includes(item.path) ? 'lightblue' : 'transparent',
                                }}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                                {openOT ? <ExpandLess /> : <ExpandMore />}
                            </ListItem>
                            <Collapse in={openOT} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <ListItem 
                                        button 
                                        sx={{ 
                                            pl: 4, 
                                            backgroundColor: location.pathname === '/list-OT/' + decodedToken?.leader ? 'lightblue' : 'transparent' 
                                        }} 
                                        onClick={() => handleNavClick({ path: '/list-OT/' + decodedToken?.leader })}
                                    >
                                        <ListItemIcon><ListAlt /></ListItemIcon>
                                        <ListItemText primary="Danh Sách OT" />
                                    </ListItem>
                                    <ListItem 
                                        button 
                                        sx={{ 
                                            pl: 4, 
                                            backgroundColor: location.pathname === '/ot-managemet-system/' + decodedToken?.leader ? 'lightblue' : 'transparent' 
                                        }} 
                                        onClick={() => handleNavClick({ path: '/ot-managemet-system/' + decodedToken?.leader })}
                                    >
                                        <ListItemIcon><PlaylistAdd /></ListItemIcon>
                                        <ListItemText primary="Yêu Cầu OT" />
                                    </ListItem>
                                </List>
                            </Collapse>
                        </div>
                    ) : (
                        <ListItem 
                            button 
                            key={item.text} 
                            onClick={() => handleNavClick(item)} 
                            sx={{
                                backgroundColor: location.pathname === item.path ? 'lightblue' : 'transparent',
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    )
                ))}
            </List>
        </Drawer>
    );
};

export default Navbar;
