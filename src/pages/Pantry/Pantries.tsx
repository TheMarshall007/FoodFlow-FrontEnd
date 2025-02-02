import  { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PantryCard from '../../components/Pantry/PantryCard';
import { useUser } from '../../context/UserContext';
import { fetchPantry, fetchLowQuantityItems, Pantry } from '../../services/pantry/pantryService';
import '../../styles/Pantries.css';
import PantryForm from './PantryForm';

const Pantries = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [pantries, setPantries] = useState<Pantry[]>([]);
    const [selectNewPantry, setSelectNewPantry] = useState<Boolean>(false);

    useEffect(() => {
        async function fetchData() {
            if (user) {
                const pant = await fetchPantry({ userId: user.id, page: 0 });
                const pantryWithLowItem = await Promise.all(pant?.map(async (invent: Pantry) => {
                    const lowItem = await fetchLowQuantityItems(invent?.id, 5);
                    return {
                        ...invent,
                        lowQuantityItems: lowItem,
                    }
                }))
                setPantries(pantryWithLowItem)
            } else {
                navigate('/');
                return;
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
