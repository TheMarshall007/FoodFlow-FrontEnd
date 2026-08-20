import React, { useEffect } from "react";

interface Props { open: boolean; onClose: () => void; }

const examples = [
    ["Leite", "1 UN", "1 L", "1 L"],
    ["Macarrão", "2 UN", "500 g", "1000 g"],
    ["Arroz", "1 PCT", "5 Kg", "5 Kg"],
    ["Ovos", "1 BDJ", "12 Unidades", "12 Unidades"],
    ["Refrigerante", "6 UN", "350 ml", "2100 ml"],
    ["Carne por peso", "0,460 Kg", "Automático", "0,460 Kg"],
    ["Papel higiênico", "1 PCT", "4 Unidades", "4 Unidades"],
];

const FiscalQuantityHelpModal: React.FC<Props> = ({ open, onClose }) => {
    useEffect(() => {
        if (!open) return;
        const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
        document.addEventListener("keydown", closeOnEscape);
        return () => document.removeEventListener("keydown", closeOnEscape);
    }, [open, onClose]);
    if (!open) return null;
    return <div className="quantity-help-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
        <section className="quantity-help-modal" role="dialog" aria-modal="true" aria-labelledby="quantity-help-title">
            <div className="quantity-help-header"><div><span className="fiscal-kicker">Guia rápido</span><h2 id="quantity-help-title">Como informar as quantidades?</h2></div>
                <button aria-label="Fechar ajuda" onClick={onClose}>×</button></div>
            <p><strong>Quantidade fiscal</strong> é o que aparece na nota. <strong>Conteúdo da embalagem</strong> é quanto existe dentro de cada caixa, pacote ou bandeja. O FoodFlow multiplica os dois para calcular o que entra na despensa.</p>
            <div className="quantity-example-highlight"><strong>Exemplo:</strong> 2 caixas de leite com 1 L cada resultam em <strong>2 L na despensa</strong>.</div>
            <div className="quantity-help-table-wrap"><table><thead><tr><th>Produto</th><th>Na nota</th><th>Cada embalagem</th><th>Entrada</th></tr></thead>
                <tbody>{examples.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div>
            <h3>Qual decisão escolher?</h3>
            <dl className="quantity-actions-help"><div><dt>Usar produto existente</dt><dd>Relaciona o item a um produto já cadastrado.</dd></div><div><dt>Criar produto temporário</dt><dd>Cadastra o item na confirmação e aprende o conteúdo informado.</dd></div><div><dt>Somente despesa</dt><dd>Registra o valor da compra, sem adicionar à despensa.</dd></div><div><dt>Ignorar</dt><dd>Não cria produto, despesa de item ou entrada de estoque.</dd></div></dl>
            <button className="fiscal-primary quantity-help-close" onClick={onClose}>Entendi</button>
        </section>
    </div>;
};
export default FiscalQuantityHelpModal;
