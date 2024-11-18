import React from 'react';
import { Pantry } from '../../services/pantryService';
import './PantryCard.css'
interface PantryCardProps {
    inv: Pantry;
}

const PantryCard: React.FC<PantryCardProps> = ({ inv }) => {
    return (
        <div className="pantry-card">
            <img
                src={inv.image}
                alt="Property"
                className="property-image"
            />
            <h3>{inv.propertyName}</h3>
            <div className='property-profile'>
                {inv.sharedWith?.map((user, key) => {
                    return <img className='property-profile-image' src={user.picture || require('../../assets/fotos/user-icon.png')} />
                })}
            </div>
            {inv.lowQuantityItems.length === 0 ?
                <p>Dispensa vazia</p>
                :
                inv.lowQuantityItems.length > 0 ? (
                    <p>
                        <span className="low-items-count">{inv.lowQuantityItems.length}</span> itens quase acabando
                    </p>
                ) : (
                    <p>Dispensa cheia</p>
                )}
                {inv.sharedWith.length >= 1 ? `${inv.sharedWith.length} menu vinculado` :
                    `${inv.sharedWith.length} menus vinculados`
                }
            <button className="pantry-card-button">&rarr;</button>
        </div>
    )
}

export default PantryCard;