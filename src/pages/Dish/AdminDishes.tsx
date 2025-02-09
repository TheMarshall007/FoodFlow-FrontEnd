import { useState, useEffect } from "react";
import "../../styles/pages/Dish/AdminDishes.css";
import { Dish, fetchDishes } from "../../services/dish/dishService";
import RegisterDishModal from "../../components/Dish/RegisterDishModal";
import RecipeModal from "../../components/Menu/RecipeModal";
import { fetchDishImage } from "../../services/dish/dishImageService";

const AdminDishes: React.FC = () => {
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupedDishes, setGroupedDishes] = useState<Record<string, Dish[]>>({});
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
    const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

    useEffect(() => {
        async function loadDishes() {
            const data = await fetchDishes({ page: 0 });

            // Capturar os IDs das imagens dos pratos
            const dishesImagesIds = data
                .filter((dish: Dish) => dish.image?.id)
                .map((dish: Dish) => dish.image!.id);

            if (dishesImagesIds.length > 0) {
                // Buscar imagens dos pratos
                const images = await fetchDishImage(dishesImagesIds);

                // Criar um dicionário para acessar as imagens rapidamente
                const imagesMap = new Map(images.map((image: any) => [image.id, image]));

                // Atualizar os pratos com as imagens carregadas
                const updatedDishes = data.map((dish: Dish) => ({
                    ...dish,
                    image: imagesMap.get(dish.image?.id) || dish.image, // Mantém a imagem original se não for encontrada
                }));

                setDishes(updatedDishes);

                // Agrupar os pratos por categoria usando `displayName`
                const grouped = updatedDishes.reduce((acc: Record<string, Dish[]>, dish: Dish) => {
                    const categoryName = dish.category?.displayName || "Outros"; // Evita erro se não houver categoria
                    if (!acc[categoryName]) {
                        acc[categoryName] = [];
                    }
                    acc[categoryName].push(dish);
                    return acc;
                }, {});

                setGroupedDishes(grouped);
            } else {
                setDishes(data);
            }
        }

        loadDishes();
    }, []);

    const handleOpenRecipeModal = (dish: Dish) => {
        setSelectedDish(dish);
        setIsRecipeModalOpen(true);
    };

    return (
        <div className="admin-dishes-container">
            <h2>Gerenciar Pratos</h2>
            <button className="add-dish-button" onClick={() => setIsModalOpen(true)}>
                Adicionar Novo Prato
            </button>

            {Object.entries(groupedDishes).map(([category, dishes]) => (
                <div key={category} className="dish-category">
                    <h3>{category}</h3>
                    <div className="dishes-grid">
                        {dishes.map((dish) => (
                            <div key={dish.id} className="dish-card" onClick={() => handleOpenRecipeModal(dish)}>
                                {dish?.image?.type && dish?.image?.image && (
                                    <img
                                        src={`data:image/${dish.image.type};base64,${dish.image.image}`}
                                        alt={dish.name}
                                        className="dish-card-image"
                                    />
                                )}
                                <div className="dish-card-info">
                                    <h4>{dish.name}</h4>
                                    <p>{dish.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Modal de Receita */}
            {selectedDish && (
                <RecipeModal
                    show={isRecipeModalOpen}
                    onClose={() => setIsRecipeModalOpen(false)}
                    dish={selectedDish}
                    isAdmin={true}
                />
            )}

            {/* Modal para adicionar prato */}
            {isModalOpen && <RegisterDishModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default AdminDishes;
