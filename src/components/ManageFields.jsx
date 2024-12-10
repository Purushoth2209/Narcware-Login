import React, { useState } from 'react';
import { db } from '../firebase';  // Import Firestore instance from firebase.js
import { collection, getDocs, updateDoc, doc, deleteField } from 'firebase/firestore';
import PropTypes from 'prop-types';  // Import PropTypes for prop validation
import './styles/ManageFields.css';

const ManageFields = ({ closeForm }) => {
  const [fieldName, setFieldName] = useState('');
  const [tableType, setTableType] = useState('users');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle adding a field to all documents
  const handleAddField = async () => {
    if (fieldName.trim() === '') {
      setErrorMessage('Field name cannot be empty');
      return;
    }

    try {
      const collectionRef = tableType === 'users' ? 'users' : 'admins';  // Determine the collection
      const querySnapshot = await getDocs(collection(db, collectionRef));  // Get all documents in the collection

      if (querySnapshot.empty) {
        setErrorMessage(`No documents found in the ${tableType} collection`);
        return;
      }

      // Loop through each document and add the new field
      querySnapshot.forEach(async (docSnap) => {
        const docRef = doc(db, collectionRef, docSnap.id);  // Get reference to each document

        // Add the new field to the document using the field name provided by the user
        await updateDoc(docRef, {
          [fieldName]: "",  // Add the field with an empty value (or a default value)
        });
      });

      alert(`Field "${fieldName}" added to all documents in the ${tableType} table`);
      setFieldName('');
      setErrorMessage('');
      closeForm(); // Close the form after adding the field
    } catch (error) {
      console.error('Error adding field: ', error);
      setErrorMessage('Error adding field to Firestore');
    }
  };

  // Handle deleting a field from all documents
  const handleDeleteField = async () => {
    if (fieldName.trim() === '') {
      setErrorMessage('Field name cannot be empty');
      return;
    }

    try {
      const collectionRef = tableType === 'users' ? 'users' : 'admins';  // Determine the collection
      const querySnapshot = await getDocs(collection(db, collectionRef));  // Get all documents in the collection

      if (querySnapshot.empty) {
        setErrorMessage(`No documents found in the ${tableType} collection`);
        return;
      }

      let fieldExists = false;
      // Loop through each document and delete the field if it exists
      querySnapshot.forEach(async (docSnap) => {
        const docRef = doc(db, collectionRef, docSnap.id);  // Get reference to each document
        const docData = docSnap.data();

        // Check if the field exists in the document data
        if (fieldName in docData) {
          fieldExists = true;
          // Delete the field from the document
          await updateDoc(docRef, {
            [fieldName]: deleteField(),
          });
        }
      });

      if (fieldExists) {
        alert(`Field "${fieldName}" deleted from all documents in the ${tableType} table`);
      } else {
        setErrorMessage(`Field "${fieldName}" does not exist in any documents of ${tableType}`);
      }

      setFieldName('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error deleting field: ', error);
      setErrorMessage('Error deleting field from Firestore');
    }
  };

  return (
    <div className="manage-fields-container">
      <h2>Manage Fields</h2>
      
      {/* Error Message */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="field-group">
        <input
          type="text"
          placeholder="Enter Field Name"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
        />
        <select value={tableType} onChange={(e) => setTableType(e.target.value)}>
          <option value="users">User Table</option>
          <option value="admins">Admin Table</option>
        </select>
      </div>

      <button onClick={handleAddField} className="field-button">Add Field</button>
      <button onClick={handleDeleteField} className="field-button delete">Delete Field</button>
      <button onClick={closeForm} className="field-button close">Close</button> {/* New Close Button */}
    </div>
  );
};

// PropTypes validation for the closeForm prop
ManageFields.propTypes = {
  closeForm: PropTypes.func.isRequired,  // Ensures closeForm is a function and is required
};

export default ManageFields;
