import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PantryCard from '../../components/Pantry/PantryCard';
import { useUser } from '../../context/UserContext';
import { fetchPantry, fetchLowQuantityItems, Pantry } from '../../services/pantry/pantryService';
import '../../styles/pages/Pantry/Pantries.css';
import PantryForm from './PantryForm';
import { fetchMenusCountByPantry } from '../../services/menu/menuService';

const Pantries = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [pantries, setPantries] = useState<Pantry[]>([]);
    const [selectNewPantry, setSelectNewPantry] = useState<Boolean>(false);
    const hasFetched = useRef(false); // Controle de execução

    useEffect(() => {
        async function fetchData() {
            if (!hasFetched.current && user) {
                hasFetched.current = true; // Marca como executado
                const pant = await fetchPantry({ userId: user.id, page: 0 });
                const pantryWithLowItem = await Promise.all(pant?.map(async (invent: Pantry) => {
                    const lowItem = await fetchLowQuantityItems(invent?.id, 5);
                    const menuCount = await fetchMenusCountByPantry(invent.id)

                    return {
                        ...invent,
                        lowQuantityItems: lowItem,
                        menuCount
                    }
                }))
                setPantries(pantryWithLowItem)
            }
        }
        fetchData()
    }, [user, navigate])

    const closeModal = () => {
        setSelectNewPantry(false);
    };

    return (
        <>
            {selectNewPantry && (
                <>
                    <div className="modal-backdrop" onClick={closeModal}></div>
                    <PantryForm />
                </>
            )}
            <div className="pantry-section">
                <h2>Despensas</h2>
                <h4 className='add-button' onClick={() => setSelectNewPantry(true)}>Adicionar</h4>
                <div className="pantry-cards">
                    {pantries?.map((pant) => (
                        <PantryCard key={pant.id} pant={pant} onClick={() => { navigate(`/pantry/${pant.id}`) }} />
                    ))}
                </div>
            </div>
        </>
    );
};

export default Pantries;
