import React, { useState } from 'react';
import { Burger, Container, Group, Menu, Avatar, UnstyledButton, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconLogout, IconLogin } from '@tabler/icons-react';
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
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Toggle for login/logout

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

  return (
    <header className="header">
      <Container size="md" className="inner">
        {/* Left Side: App Name */}
        <div>TSHeardle</div>

        {/* Center: Navigation Links */}
        <Group spacing={5} className="links">
          {items}
        </Group>

        {/* Right Side: Login/Logout or User Profile */}
        <Group>
          {isLoggedIn ? (
            <Menu position="bottom-end" transitionProps={{ transition: 'pop-top-right' }} withinPortal>
              <Menu.Target>
                <UnstyledButton>
                  <Group spacing={7}>
                    <Avatar src={user.image} alt={user.name} radius="xl" size={30} />
                    <Text size="sm">{user.name}</Text>
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
            <UnstyledButton onClick={() => setIsLoggedIn(true)}> {/* Login logic */}
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