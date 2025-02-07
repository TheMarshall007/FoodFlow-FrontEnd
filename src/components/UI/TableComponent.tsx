import React from "react";
import "../../styles/ui/TableComponent.css";

interface TableColumn {
  header: string;
  key: string;
  render?: (value: any, row: any, onEdit?: (key: string, value: any, row: any) => void) => JSX.Element;
}

interface TableComponentProps {
  columns: TableColumn[];
  data: any[];
  editableFields?: string[];
  onEdit?: (key: string, value: any, row: any) => void;
}

const TableComponent: React.FC<TableComponentProps> = ({ columns, data, editableFields = [], onEdit }) => {
  return (
    <table className="generic-table">
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render ? (
                    column.render(row[column.key], row, onEdit)
                  ) : editableFields.includes(column.key) && onEdit ? (
                    <input
                      type="text"
                      value={row[column.key]}
                      onChange={(e) => onEdit(column.key, e.target.value, row)}
                    />
                  ) : (
                    row[column.key]
                  )}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} style={{ textAlign: "center" }}>
              Nenhum dado disponível
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default TableComponent;
