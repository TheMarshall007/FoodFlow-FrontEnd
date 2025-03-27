import { Product } from "../services/product/productService";
import { ShoppingList } from "../services/shopping/shoppingListService";
import { Ingredient } from "../services/ingredients/ingredientsService";

/**
 * Atualiza os nomes dos ingredientes dentro da lista de compras.
 */
export const updateShoppingListWithProductNames = (
    shoppingList: ShoppingList,
    products: Product[],
    ingredients: Ingredient[] // Change: Now expects an array of Ingredients
): ShoppingList => {
    const updatedProducts = shoppingList.products.map((item) => {
        // Buscar o produto correspondente
        const product = products.find((product) => product.gtin === item.systemProductGtin);

        // Buscar o ingrediente correspondente ao produto
        const ingredient = ingredients.find((ingredient) => product?.ingredientsIds.includes(ingredient.id));

        return {
            ...item,
            name: product && ingredient ? `${ingredient.name} (${product.brand || "Marca Desconhecida"})` : "Produto Desconhecido",
        };
    });

    return { ...shoppingList, products: updatedProducts };
};
