import React from 'react';
import './index.css';

const Table = ({ items, columns }) => (
  <div className="table">
    <div className="table__body">
      <table>
        <thead>
          <tr>
            {columns.map(({ name, label }) => (
              <th key={`thead-col-${name}`}>
                <div title={label}>
                  <span className="table__title">
                    {label}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {items.map((item, rowIndex) => (
            <tr key={`tbody-row-${rowIndex}`}>
              {columns.map(({ name, render }, colIndex) => (
                <td key={`tbody-col-${name}`}>
                  {render(item, name, rowIndex, colIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Table;
