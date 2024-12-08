import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './styles/AddUserAdmin.css';

const AddUserAdmin = ({ formType, closeForm }) => {
  const [formData, setFormData] = useState({ name: '', email: '', role: '', password: '' });
  const [fields, setFields] = useState([]);

  // Fetch fields from the Firestore collection (users or admins)
  const fetchFields = async (collectionName) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const allFields = new Set();

      querySnapshot.forEach((doc) => {
        Object.keys(doc.data()).forEach((key) => {
          allFields.add(key);
        });
      });

      setFields(Array.from(allFields));
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

  useEffect(() => {
    if (formType === 'user') {
      fetchFields('users');
    } else if (formType === 'admin') {
      fetchFields('admins');
    }
  }, [formType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(formData.email, formData.password);
      const userId = userCredential.user.uid;

      await setDoc(doc(db, formType === 'user' ? 'users' : 'admins', userId), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });

      alert(`${formType.charAt(0).toUpperCase() + formType.slice(1)} added successfully!`);
      setFormData({ name: '', email: '', role: '', password: '' });
      closeForm();
    } catch (error) {
      console.error(`Error adding ${formType}:`, error);
    }
  };

  return (
    <div className="form-overlay">
      <form onSubmit={handleSubmit} className="add-form">
        <h3>{formType === 'user' ? 'Add User' : 'Add Admin'}</h3>

        {fields.map((field, index) => (
          field !== 'password' && (
            <div key={index}>
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
              <input
                type="text"
                name={field}
                value={formData[field] || ''}
                onChange={handleInputChange}
                required
              />
            </div>
          )
        ))}

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />

        <div className="form-buttons">
          <button type="submit" className="submit-button">Submit</button>
          <button type="button" className="cancel-button" onClick={closeForm}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

AddUserAdmin.propTypes = {
  formType: PropTypes.oneOf(['user', 'admin']).isRequired,
  closeForm: PropTypes.func.isRequired,
};

export default AddUserAdmin;
