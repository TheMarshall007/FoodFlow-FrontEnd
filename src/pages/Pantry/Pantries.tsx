import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PantryCard from '../../components/Pantry/PantryCard';
import '../../styles/pages/Pantry/Pantries.css';
import PantryForm from '../../components/Pantry/PantryForm';
import { usePantry } from '../../hooks/pentry/usePentry';

const Pantries = () => {
    const navigate = useNavigate();
    const { state } = usePantry();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (state.loading) return <p>Carregando despensas...</p>;
    if (!state.pantries) {
        return <p>Despensa não encontrada...</p>;
    }

    return (
        <div className="pantry-section">
            <h2>Despensas</h2>
            <h4 className="add-button" onClick={() => setIsModalOpen(true)}>Adicionar</h4>

            {state.pantries.length === 0 ? (
                <p>Nenhuma despensa encontrada.</p>
            ) : (
                <div className="pantry-cards">
                    {state.pantries.map((pant) => (
                        <PantryCard key={pant.id} pant={pant} onClick={() => navigate(`/pantry/${pant.id}`)} />
                    ))}
                </div>
            )}

            <PantryForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default Pantries;
