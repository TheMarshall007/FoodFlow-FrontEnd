import React from 'react';
import { Pantry } from '../../services/pantry/pantryService';
import '../../styles/components/Pantry/PantryCard.css'
interface PantryCardProps {
    pant: Pantry;
    onClick(): void
}

const PantryCard: React.FC<PantryCardProps> = ({ pant, onClick }) => {
    return (
        <div className="pantry-card" onClick={() => onClick()}>
            <img
                src={pant?.image}
                alt="Property"
                className="property-image"
            />
            <h3>{pant?.propertyName}</h3>
            <div className='property-profile'>
                {pant?.sharedWith?.map((user, key) => {
                    return <img className='property-profile-image' src={user?.picture || require('../../assets/fotos/user-icon.png')} />
                })}
            </div>
            {pant?.lowQuantityProducts?.length === 0 ?
                <p>Dispensa vazia</p>
                :
                pant?.lowQuantityProducts?.length > 0 ? (
                    <p>
                        <span className="low-items-count">{pant?.lowQuantityProducts?.length}</span> itens quase acabando
                    </p>
                ) : (
                    <p>Dispensa cheia</p>
                )}
            {pant?.menuCount !== undefined ?
                pant?.menuCount >= 1 ?
                    `${pant?.menuCount} menu vinculado` :
                    `${pant?.menuCount} menus vinculados` :
                "0 menus vinculados"
            }
            <button className="pantry-card-button">&rarr;</button>
        </div>
    )
}

export default PantryCard;