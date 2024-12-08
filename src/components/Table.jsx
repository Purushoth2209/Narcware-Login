import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { FaEllipsisV, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import PropTypes from 'prop-types';
import './styles/Table.css';

const Table = ({ collectionName }) => {
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [columns, setColumns] = useState([]);
  const [reorderEnabled, setReorderEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = () => {
      const colRef = collection(db, collectionName);

      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        const fetchedData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setData(fetchedData);
        setFilteredData(fetchedData);

        const allColumns = new Set();
        fetchedData.forEach((doc) => {
          Object.keys(doc).forEach((key) => {
            if (key !== 'id') {
              allColumns.add(key);
            }
          });
        });

        const columnsArray = [...allColumns];
        const savedColumnOrder = JSON.parse(localStorage.getItem('columnOrder'));

        if (savedColumnOrder) {
          setColumns(savedColumnOrder.filter((col) => col !== 'id'));
        } else {
          setColumns(columnsArray);
        }
      });

      return unsubscribe;
    };

    fetchData();
  }, [collectionName]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = data.filter((item) =>
      columns.some((col) => item[col]?.toString().toLowerCase().includes(query))
    );

    setFilteredData(filtered);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
  };

  const handleSave = async (id, updatedValues) => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, updatedValues);
    setEditIndex(null);
  };

  const handleDelete = async (id) => {
    const confirmation = window.confirm('Are you sure you want to delete this record?');
    if (confirmation) {
      await deleteDoc(doc(db, collectionName, id));
    }
  };

  const moveColumn = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= columns.length) return;

    const newColumns = [...columns];
    [newColumns[index], newColumns[newIndex]] = [newColumns[newIndex], newColumns[index]];
    setColumns(newColumns);
    localStorage.setItem('columnOrder', JSON.stringify(newColumns));
  };

  const handleKeyPress = (e, id, updatedValues) => {
    if (e.key === 'Enter') {
      handleSave(id, updatedValues);
    }
  };

  return (
    <div className="table-container">
      <h2 className="table-title">{collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}</h2>

      <div className="table-controls">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button onClick={() => setReorderEnabled(!reorderEnabled)} className="reorder-button">
          {reorderEnabled ? 'Disable Reorder' : 'Enable Reorder'}
        </button>
      </div>

      <table>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={col}>
                <div className="column-header">
                  {col}
                  {reorderEnabled && (
                    <div className="reorder-buttons">
                      <FaArrowUp onClick={() => moveColumn(index, -1)} className="reorder-icon" />
                      <FaArrowDown onClick={() => moveColumn(index, 1)} className="reorder-icon" />
                    </div>
                  )}
                </div>
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map((item, rowIndex) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td key={col}>
                  {editIndex === rowIndex ? (
                    <input
                      type="text"
                      defaultValue={item[col]}
                      onChange={(e) => {
                        item[col] = e.target.value;
                      }}
                      onKeyPress={(e) => handleKeyPress(e, item.id, item)}
                    />
                  ) : (
                    <span>{item[col]}</span>
                  )}
                </td>
              ))}
              <td>
                <div className="actions-menu">
                  <FaEllipsisV className="menu-icon" />
                  <div className="dropdown-content">
                    {editIndex === rowIndex ? (
                      <button onClick={() => handleSave(item.id, item)}>Save</button>
                    ) : (
                      <button onClick={() => handleEdit(rowIndex)}>Update</button>
                    )}
                    <button onClick={() => handleDelete(item.id)}>Delete</button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Table.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default Table;
  