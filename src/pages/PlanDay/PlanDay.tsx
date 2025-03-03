import React from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/pages/PlanDay/PlanDay.css';

interface MenuProduct {
    id: number;
    name: string;
    description: string;
}

const PlanDay: React.FC = () => {
    const { pantryId } = useParams<{ pantryId: string }>();
    const [menuProducts, setMenuProducts] = React.useState<MenuProduct[]>([
        { id: 1, name: 'Strogonoff de Frango', description: 'Delicioso strogonoff de frango com arroz.' },
        { id: 2, name: 'Salada de Frutas', description: 'Salada fresca de frutas.' },
    ]);

    const handleAddToPantry = (menuProductId: number) => {
        alert(`Prato ${menuProductId} vinculado ao inventário ${pantryId}!`);
    };

    return (
        <div className="plan-day">
            <h1>Planejar Dia - Inventário {pantryId}</h1>
            <div className="menu-list">
                {menuProducts?.map((item) => (
                    <div key={item.id} className="menu-card">
                        <h2>{item.name}</h2>
                        <p>{item.description}</p>
                        <button
                            className="add-button"
                            onClick={() => handleAddToPantry(item.id)}
                        >
                            Adicionar ao Planejamento
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlanDay;
