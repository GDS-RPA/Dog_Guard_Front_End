import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Collapse } from '@mui/material';
import { People, AccountCircle, RequestQuoteSharp, ExpandLess, ExpandMore, ListAlt, PlaylistAdd, Leaderboard, Description } from '@mui/icons-material';
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
            navigate(item.path);
        }
    };

    const handleOTClick = () => {
        setOpenOT(!openOT); // Mở/đóng submenu
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
                    { text: 'Quản Lý User', icon: <AccountCircle />, isReload: false, path: '/admin/management-user' },
                    { text: 'Quản Lý OT', icon: <ListAlt />, isReload: false, path: '/admin/list-OT' },
                    { text: 'Quản Lý Leader', icon: <Leaderboard />, path: '/admin/management-leader' },
                    { text: 'Quản Lý Log', icon: <RequestQuoteSharp />, isSubmenu: true  },
                ].map((item) => (
                    item.isSubmenu ? (
                        <div key={item.text}>
                            <ListItem 
                                button 
                                onClick={handleOTClick}
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
                                            backgroundColor: location.pathname === '/admin/list-log' ? 'lightblue' : 'transparent',
                                        }} 
                                        onClick={() => handleNavClick({ path: '/admin/list-log' })}
                                    >
                                        <ListItemIcon><ListAlt /></ListItemIcon>
                                        <ListItemText primary="Danh Sách Log" />
                                    </ListItem>
                                    <ListItem 
                                        button 
                                        sx={{ 
                                            pl: 4, 
                                            backgroundColor: location.pathname === '/admin/list-former-user' ? 'lightblue' : 'transparent',
                                        }} 
                                        onClick={() => handleNavClick({ path: '/admin/list-former-user' })}
                                    >
                                        <ListItemIcon><PlaylistAdd /></ListItemIcon>
                                        <ListItemText primary="No Log User" />
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
