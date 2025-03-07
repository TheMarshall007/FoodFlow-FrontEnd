import { Product } from "../services/product/productService";
import { ShoppingList } from "../services/shopping/shoppingListService";
import { Variety } from "../services/variety/varietyService";

/**
 * Atualiza os nomes dos ingredientes dentro da lista de compras.
 */
export const updateShoppingListWithProductNames = (
    shoppingList: ShoppingList,
    products: Product[],
    varieties: Variety[]
): ShoppingList => {
    const updatedProducts = shoppingList.products.map((item) => {
        // Buscar o produto correspondente
        const product = products.find((product) => product.gtin === item.systemProductGtin);

        // Buscar a variedade correspondente ao produto
        const variety = varieties.find((variety) => variety.id === product?.varietyId);

        return {
            ...item,
            name: product ? `${variety?.name} (${product.brand || "Variedade Desconhecida"})` : "Produto Desconhecido",
        };
    });

    return { ...shoppingList, products: updatedProducts };
};

