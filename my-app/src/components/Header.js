import React, { useState, useEffect} from 'react';
import { Burger, Container, Group, Menu, Avatar, UnstyledButton, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconLogout, IconLogin } from '@tabler/icons-react';
import { IconMusic } from '@tabler/icons-react';
import { fetchUserProfile } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import './Header.css'; // Correctly import the CSS file

const links = [
  { link: '/game', label: 'Game' },
  { link: '/stats', label: 'My Stats' },
  { link: '/about', label: 'About' },
];

const user = {
  name: 'Jane Swift',
  email: 'jane.swift@example.com',
  image: 'https://avatars.githubusercontent.com/u/1?v=4', // Sample avatar
};

export function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("checking user profile")
    fetchUserProfile()
      .then(profile => {
        if (profile.display_name) {
          setUser(profile);
        } else {
          setUser(null);
        }
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
        setUser(null);
      });
  }, []);

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={`link ${active === link.link ? 'active' : ''}`}
      onClick={(event) => {
        event.preventDefault();
        setActive(link.link);
      }}
    >
      {link.label}
    </a>
  ));

  const handleTitleClick = () => {
    navigate('/'); // Navigate to the login page or home page
  };


  return (
    <header className="header">
      <Container size="md" className="inner">
        {/* Left Side: App Name */}
        <div style={{ display: 'flex', alignItems: 'left' }} onClick={handleTitleClick}>
        <IconMusic size={24} style={{ marginRight: '8px' }} /> {/* Add the music icon */}
        <Title order={4}>Heardle</Title>
      </div>

        {/* Center: Navigation Links */}
        <Group spacing={5} className="links">
          {items}
        </Group>

        {/* Right Side: Login/Logout or User Profile */}
        <Group>
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
                  onClick={() => setIsLoggedIn(false)} // Logout logic
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <UnstyledButton onClick={() => navigate('/login')}> {/* Login logic */}
              <Group>
                <IconLogin size={20} />
                <Text>Login</Text>
              </Group>
            </UnstyledButton>
          )}
        </Group>

        {/* Burger Menu for Mobile */}
        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
}