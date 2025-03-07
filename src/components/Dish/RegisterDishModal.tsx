import { useEffect, useState } from "react";
import "../../styles/components/Dishes/RegisterDishModal.css";
import { createDish, Dish, updateDish } from "../../services/dish/dishService";
import { fetchVariety, Variety } from "../../services/variety/varietyService";
import { Category, fetchCategories } from "../../services/dish/dishCategoryService";
import { fetchIngredients, Ingredient } from "../../services/ingredients/ingredientsService";
import { fetchDishIngredientsByIds, DishIngredient } from "../../services/dish/dishIngredientService";

interface ModalProps {
    onClose: () => void;
    dish?: Dish;
}

interface SelectedIngredient {
    ingredientId: number;
    varietyId: number | null;
    quantity: number;
    unit: "g" | "Kg" | "ml" | "L";
}

const RegisterDishModal: React.FC<ModalProps> = ({ onClose, dish }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [varieties, setVarieties] = useState<Variety[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([
        { ingredientId: 0, varietyId: null, quantity: 0, unit: "g" },
    ]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [originalImage, setOriginalImage] = useState<{ image: string; type: string } | undefined>(undefined);//Novo estado

    useEffect(() => {
        async function loadData() {
            try {
                const ingredientsData = await fetchIngredients({ page: 0 });
                setIngredients(ingredientsData);
                const varietyData = await fetchVariety({ page: 0 });
                setVarieties(varietyData.content);
                const categoriesData = await fetchCategories({ page: 0 });
                setCategories(categoriesData.content);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                alert("Erro ao carregar dados para cadastrar um novo prato.");
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        async function loadDishDetails() {
            if (dish) {
                setIsEditing(true);
                setName(dish.name);
                setDescription(dish.description);
                setSelectedCategory(dish.category.id);
                //Verifica se existe imagem, se existir, seta ela como original, e tambem coloca a imagem na preview.
                if (dish.image?.image && dish.image?.type) {
                    setOriginalImage({ image: dish.image.image, type: dish.image.type }) //salva a imagem original.
                    setImagePreview(`data:image/${dish.image.type};base64,${dish.image.image}`);
                }

                if (dish.ingredientsId && dish.ingredientsId.length > 0) {
                    try {
                        const dishIngredients: DishIngredient[] = await fetchDishIngredientsByIds(dish.ingredientsId);
                        const mappedIngredients: SelectedIngredient[] = dishIngredients.map((ing) => ({
                            ingredientId: ing.systemIngredient.id,
                            varietyId: ing.variety?.id || null,
                            quantity: ing.quantity,
                            unit: ing.unit as "g" | "Kg" | "ml" | "L",
                        }));

                        setSelectedIngredients(mappedIngredients);
                    } catch (error) {
                        console.error("Erro ao carregar detalhes dos ingredientes do prato:", error);
                        alert("Erro ao carregar detalhes dos ingredientes do prato.");
                    }
                } else {
                    setSelectedIngredients([{ ingredientId: 0, varietyId: null, quantity: 0, unit: "g" }]);
                }
            } else {
                setSelectedIngredients([{ ingredientId: 0, varietyId: null, quantity: 0, unit: "g" }]);
            }
        }
        loadDishDetails();
    }, [dish]);

    const addIngredient = () => {
        setSelectedIngredients([
            ...selectedIngredients,
            { ingredientId: 0, varietyId: null, quantity: 0, unit: "g" },
        ]);
    };

    const updateIngredient = (index: number, field: string, value: any) => {
        const updatedIngredients = [...selectedIngredients];
        updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
        setSelectedIngredients(updatedIngredients);
    };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null)
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        //Montar o objeto de acordo com o DTO do backend
        const dishData = {
            name: name,
            description: description,
            categoryId: selectedCategory,
            // Verificando se a imagem foi alterada.
            image: imagePreview && originalImage?.image != imagePreview.split(',')[1] ? { image: imagePreview.split(',')[1], type: image?.type } : originalImage,
            ingredients: selectedIngredients.map((ing) => ({
                ingredientId: ing.ingredientId,
                varietyId: ing.varietyId,
                quantity: ing.quantity,
                unit: ing.unit,
            })),
        };

        try {
            if (isEditing) {
                if (dish) {
                    await updateDish({ ...dishData, id: dish.id });
                    alert("Prato atualizado com sucesso!");
                }
            } else {
                const response = await createDish(dishData);
                console.log(response)
                alert("Prato cadastrado com sucesso!");
            }
            onClose();
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                alert(`Erro ao cadastrar/editar prato: ${error.response.data.message}`);
            } else {
                alert("Erro ao cadastrar/editar prato.");
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>{isEditing ? "Editar Prato" : "Adicionar Novo Prato"}</h2>
                <form onSubmit={handleSubmit}>
                    <label>Nome do Prato:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

                    <label>Descrição:</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />

                    <label>Imagem:</label>
                    <input type="file" onChange={handleImageChange} />
                    {imagePreview && (
                        <img src={imagePreview} alt="Prévia da Imagem" style={{ maxWidth: "200px" }} />
                    )}
                    <label>Categoria</label>
                    <select
                        value={selectedCategory || ""}
                        onChange={(e) =>
                            setSelectedCategory(e.target.value ? Number(e.target.value) : null)
                        }
                        required
                    >
                        <option value="">Selecione uma Categoria</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.displayName}
                            </option>
                        ))}
                    </select>
                    <h3>Ingredientes:</h3>
                    <div className="ingredients-container">
                        {selectedIngredients.map((ingredient, index) => (
                            <div key={index} className="ingredient-row">
                                {/* Ingrediente */}
                                <select
                                    value={ingredient.ingredientId}
                                    onChange={(e) => updateIngredient(index, "ingredientId", Number(e.target.value))}
                                >
                                    <option value={0}>Selecione um ingrediente</option>
                                    {ingredients.map((ing) => (
                                        <option key={ing.id} value={ing.id}>
                                            {ing.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Variedade */}
                                <select
                                    value={ingredient.varietyId || ""}
                                    onChange={(e) =>
                                        updateIngredient(index, "varietyId", e.target.value ? Number(e.target.value) : null)
                                    }
                                >
                                    <option value="">Sem Variedade</option>
                                    {varieties
                                        .filter((v) => (v.ingredientId === ingredient.ingredientId))
                                        .map((variety) => (
                                            <option key={variety.id} value={variety.id}>
                                                {variety.name}
                                            </option>
                                        ))}
                                </select>

                                {/* Quantidade */}
                                <input
                                    type="number"
                                    value={ingredient.quantity}
                                    onChange={(e) => updateIngredient(index, "quantity", Number(e.target.value))}
                                    placeholder="Quantidade"
                                />

                                {/* Unidade */}
                                <select
                                    value={ingredient.unit}
                                    onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                                >
                                    <option value="g">g</option>
                                    <option value="Kg">Kg</option>
                                    <option value="ml">ml</option>
                                    <option value="L">L</option>
                                </select>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addIngredient}>Adicionar Ingrediente</button>
                    <button type="submit">{isEditing ? "Atualizar Prato" : "Cadastrar"}</button>
                </form>
            </div>
        </div>
    );
};

export default RegisterDishModal;
