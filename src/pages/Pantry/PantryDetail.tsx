import React, { useEffect, useState } from 'react';
import { fetchLowQuantityItems, fetchPantry, Pantry } from '../../services/pantryService';
import './PantryDetail.css';
import { useUser } from '../../context/UserContext';
import { useParams, useNavigate } from 'react-router-dom';

const PantryDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useUser();
    const navigate = useNavigate();
    const [pantry, setPantry] = useState<Pantry>();

    useEffect(() => {
        async function fetchData() {
            if (user && id) {
                try {
                    let pant = await fetchPantry({ pantryId: parseInt(id), page: 0 });
                    pant = pant[0]
                    if (pant) {
                        const lowItems = await fetchLowQuantityItems(pant.id, 5);
                        setPantry({
                            ...pant,
                            lowQuantityItems: lowItems
                        });
                    }
                } catch (error) {
                    console.error("Erro ao buscar a despensa:", error);
                }
            }
        }
        fetchData();
    }, [user, id]);

    if (!pantry) {
        return <p>Carregando ou despensa não encontrada...</p>;
    }

    return (
        <div className="pantry-detail-container">
            <div className="pantry-header">
                <img src={pantry?.image} alt={pantry?.propertyName} className="pantry-image" />
                <div className="pantry-info">
                    <h2>{pantry?.propertyName}</h2>
                    <p>{pantry?.sharedWith?.length ?? 0} Menu vinculado</p>
                    <p className="low-quantity">{pantry?.lowQuantityItems?.length} itens quase acabando</p>
                </div>
            </div>
            <div className="pantry-items">
                {pantry?.items?.map((item, index) => (
                    <div key={index} className={`pantry-item ${pantry?.lowQuantityItems.includes(item) ? 'low-stock' : ''}`}>
                        <img src={item.image} alt={item.name} className="item-image" />
                        <p>{item.name}</p>
                        <p>{item.quantity}x</p>
                    </div>
                ))}
            </div>
            <button className="add-items-button" onClick={()=> navigate(`/pantry/${id}/add-items`)}>Adicionar Itens</button>
        </div>
    );
};

export default PantryDetail;