import React, { useState, useEffect } from 'react';
import { Container, Group, Menu, Avatar, UnstyledButton, Text, Title, Burger } from '@mantine/core';
import { fetchUserProfile, logout } from '../utils/api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { IconChevronDown, IconLogout, IconLogin, IconMusic } from '@tabler/icons-react';
import './Header.css'; 

// Links for navigation
const links = [
  { link: '/Home', label: 'Home' },
  { link: '/dashboard', label: 'Game' },
  { link: '/stats', label: 'My Stats' },
  // { link: '/about', label: 'About' },
];

export function HeaderSimple() {
  const [user, setUser] = useState(null);
  const [opened, setOpened] = useState(false); // Manage burger menu state
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user profile on load
  useEffect(() => {
    console.log('checking user profile');
    fetchUserProfile()
      .then((profile) => {
        if (profile.display_name) {
          setUser(profile);
        } else {
          setUser(null);
        }
      })
      .catch((error) => {
        console.error('Error fetching user profile:', error);
        setUser(null);
      });
  }, []);

  const items = links.map((link) => (
    <Link
      key={link.label}
      to={link.link} // Use `to` instead of `href` for navigation
      className={`link ${location.pathname === link.link ? 'active' : ''}`}
    >
      {link.label}
    </Link>
  ));

  const handleTitleClick = () => {
    navigate('/'); // Navigate to the home page
  };

  const toggleBurger = () => {
    setOpened((prev) => !prev); // Toggle burger menu
  };

  return (
    <header className="header">
      <Container size="md" className="inner">
        {/* Left Side: App Name */}
        <div style={{ display: 'flex', alignItems: 'left' }} onClick={handleTitleClick}>
       <IconMusic size={24} style={{ marginRight: '8px' }} /> {/* Add the music icon */}
      <Title order={4}>MelodyMatch</Title>
      </div>

        {/* Center: Navigation Links */}
        <Group spacing={5} className="links">
          {items}
        </Group>

        {/* Right Side: Burger Menu for Mobile */}
        <div className="mobile-menu">
          <Burger
            opened={opened}
            onClick={toggleBurger}
            className="burger-menu"
            size="sm"
            style={{ color: '#000' }}
          />
          {opened && (
            <div className="mobile-links">
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.link}
                  className="link"
                  onClick={() => setOpened(false)} // Close burger when a link is clicked
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Login/Logout or User Profile */}
        <div className="right">
          {user ? (
            <Menu position="bottom-end" transitionProps={{ transition: 'pop-top-right' }} withinPortal>
              <Menu.Target>
                <UnstyledButton>
                  <Group spacing={7}>
                    <Avatar src={user.image} alt={user.name} radius="xl" size={30} />
                    <Text size="sm">{user.display_name}</Text>
                    <IconChevronDown size={12} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  icon={<IconLogout size={16} />}
                  onClick={() => logout()} // Logout logic
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <UnstyledButton onClick={() => navigate('/stats')}>
              <Group>
                <IconLogin size={15} />
                <Text size="sm">Login</Text>
              </Group>
            </UnstyledButton>
          )}
        </div>
      </Container>
    </header>
  );
}

