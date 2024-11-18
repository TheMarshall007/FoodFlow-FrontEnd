import userEvent from '@testing-library/user-event';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PantryCard from '../../components/Pantry/PantryCard';
import { useUser } from '../../context/UserContext';
import { fetchPantry, fetchLowQuantityItems, Pantry } from '../../services/pantryService';
import './Pantries.css';

const Pantries = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    // const [inventories, setInventories] = React.useState<Pantry[]>([
    //     { id: 1, propertyName: 'Casa Principal', items: [], lowStock: false },
    //     { id: 2, propertyName: 'Casa de Praia', items: [], sharedWith:[],  },
    // ]);
    const [inventories, setInventories] = useState<Pantry[]>([]);

    useEffect(() => {
        async function fetchData() {
            if (user) {
                const inv = await fetchPantry({ userId: user.id, inventoryId: 1, page: 0 });
                const inventoryWithLowItem = await Promise.all(inv?.map(async (invent: Pantry) => {
                    const lowItem = await fetchLowQuantityItems(invent?.id, 5);
                    return {
                        ...invent,
                        lowQuantityItems: lowItem,
                        image: require('../../assets/fotos/summer-beach-house.png'),
                        sharedWith: [{
                            id: 1,
                            name: 'leo',
                            email: 'leo',
                            picture: ''
                        }, {
                            id: 2,
                            name: 'leo',
                            email: 'leo',
                            picture: ''
                        }]
                    }
                }))
                setInventories(inventoryWithLowItem)
            } else {
                navigate('/');
                return;
            }
        }
        fetchData()
    }, [user, navigate])

    const handlePlanDay = (inventoryId: number) => {
        navigate(`/plan-day/${inventoryId}`);
    };

    return (
        <div className="pantry-section">
            <h2>Inventários</h2>
            <div className="pantry-cards">
                {inventories.map((inventories) => (
                    <PantryCard inv={inventories} />
                ))}
            </div>
        </div>
    );
};

export default Pantries;
