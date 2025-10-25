import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
  Collapse,
} from '@mui/material';
import {
  Dashboard,
  Event,
  FindInPage,
  Feedback,
  Groups,
  Campaign,
  ExpandLess,
  ExpandMore,
  School,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [openSections, setOpenSections] = useState({
    events: false,
    community: false,
  });

  const handleSectionClick = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/',
    },
    {
      text: 'Events',
      icon: <Event />,
      path: '/events',
      section: 'events',
      children: [
        { text: 'All Events', path: '/events' },
        { text: 'My Events', path: '/events/my-events' },
        ...(user?.role === 'faculty' || user?.role === 'admin' ? [
          { text: 'Create Event', path: '/events/create' }
        ] : []),
      ]
    },
    {
      text: 'Lost & Found',
      icon: <FindInPage />,
      path: '/lost-found',
    },
    {
      text: 'Feedback',
      icon: <Feedback />,
      path: '/feedback',
      section: 'community',
      children: [
        { text: 'My Feedback', path: '/feedback' },
        { text: 'Submit Feedback', path: '/feedback/submit' },
        ...(user?.role === 'faculty' || user?.role === 'admin' ? [
          { text: 'Manage Feedback', path: '/feedback/manage' }
        ] : []),
      ]
    },
    {
      text: 'Clubs',
      icon: <Groups />,
      path: '/clubs',
      section: 'community',
      children: [
        { text: 'All Clubs', path: '/clubs' },
        { text: 'My Clubs', path: '/clubs/my-clubs' },
        ...(user?.role === 'student' ? [
          { text: 'Join Club', path: '/clubs/join' }
        ] : []),
        ...(user?.role === 'faculty' || user?.role === 'admin' ? [
          { text: 'Manage Clubs', path: '/clubs/manage' }
        ] : []),
      ]
    },
    {
      text: 'Announcements',
      icon: <Campaign />,
      path: '/announcements',
    },
  ];

  // Add admin-specific items
  if (user?.role === 'admin' || user?.role === 'faculty') {
    menuItems.push({
      text: 'Approvals',
      icon: <CheckCircle />,
      path: '/admin/approvals',
    });
  }

  if (user?.role === 'admin') {
    menuItems.push({
      text: 'Administration',
      icon: <School />,
      section: 'admin',
      children: [
        { text: 'User Management', path: '/admin/users' },
        { text: 'System Settings', path: '/admin/settings' },
        { text: 'Reports', path: '/admin/reports' },
      ]
    });
  }

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <School sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" noWrap component="div">
            Smart Campus
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  if (item.children) {
                    handleSectionClick(item.section);
                  } else {
                    handleNavigation(item.path);
                  }
                }}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {item.children && (
                  openSections[item.section] ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>
            </ListItem>
            {item.children && (
              <Collapse in={openSections[item.section]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.path}
                      sx={{ pl: 4 }}
                      onClick={() => handleNavigation(child.path)}
                      selected={location.pathname === child.path}
                    >
                      <ListItemText primary={child.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
