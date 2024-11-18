// Menus.tsx
import React, { useEffect, useState } from 'react';
import './Menus.css';
import { fetchMenu, MenuData } from '../../services/menuService';
import { useUser } from '../../context/UserContext';
import Menu from '../../components/Menu/Menu';

const Menus = () => {
    const { user } = useUser();
    const [menuData, setMenuData] = useState<MenuData[]>([]);
    const [selectedMenu, setSelectedMenu] = useState<MenuData | null>(null);

    useEffect(() => {
        async function fetchData() {
            if (user) {
                const menuData = await fetchMenu({ userId: user.id, page: 0 });
                setMenuData(menuData);
            }
        }
        fetchData();
    }, [user]);

    const openMenu = (menu: MenuData) => {
        setSelectedMenu(menu);
    };

    const closeMenu = () => {
        setSelectedMenu(null);
    };

    return (
        <div className="menu-section">
            {selectedMenu ? (
                <div className="selected-menu">
                    <button className="back-button" onClick={closeMenu}>Voltar</button>
                    <Menu menu={selectedMenu} />
                </div>
            ) : (
                <>
                    <h2>Menus</h2>
                    <div className="menu-cards">
                        {menuData.map((menu, index) => (
                            <div className="menu-card" key={index}>
                                <h3 className="menu-name">{menu.name}</h3>
                                <p className="menu-info">{menu.dishesId.length} Receitas</p>
                                <p className="menu-info">
                                    {menu?.sharedWithId?.length > 0
                                        ? `${menu.sharedWithId.length} dispensa vinculada`
                                        : 'nenhuma dispensa vinculada'}
                                </p>
                                <button className="menu-button" onClick={() => openMenu(menu)}>
                                    Ver mais
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Menus;
