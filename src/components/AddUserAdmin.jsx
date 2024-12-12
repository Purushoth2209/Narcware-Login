import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getDocs, collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './styles/AddUserAdmin.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddUserAdmin = ({ formType, closeForm, userId }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [fields, setFields] = useState([]);
  const [error, setError] = useState('');

  // Fetch fields from Firestore collection
  const fetchFields = async (collectionName) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const allFields = new Set();

      querySnapshot.forEach((doc) => {
        Object.keys(doc.data()).forEach((key) => {
          if (key !== 'id' && key !== 'role') {
            allFields.add(key);
          }
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
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const userId = userCredential.user.uid;

      await setDoc(doc(db, formType === 'user' ? 'users' : 'admins', userId), {
        name: formData.name,
        email: formData.email,
      });

      // Display success message for adding user or admin
      toast.success(`${formType.charAt(0).toUpperCase() + formType.slice(1)} added successfully!`);

      setFormData({ name: '', email: '', password: '' });
      closeForm();
    } catch (error) {
      setError(error.message); // Set the error message to display it in the form
      console.error(`Error adding ${formType}:`, error);
    }
  };

  const handleDelete = async () => {
    try {
      if (userId) {
        // Call backend API to delete the user from both Firestore and Firebase Authentication
        const response = await fetch('http://localhost:5000/delete-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, formType }),
        });

        const data = await response.json();
        if (data.success) {
          // Display success message for deleting user or admin
          toast.success(`${formType.charAt(0).toUpperCase() + formType.slice(1)} deleted successfully!`);
          closeForm();
        } else {
          setError('Failed to delete user.');
          console.error('Backend deletion failed:', data.message);
        }
      } else {
        setError('User ID not found.');
      }
    } catch (error) {
      setError('Error deleting user.');
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="form-overlay">
      <form onSubmit={handleSubmit} className="add-form">
        <h3>{formType === 'user' ? 'Add User' : 'Add Admin'}</h3>

        {fields.map((field, index) => (
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
        ))}

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />

        {error && <p className="error-message">{error}</p>}

        <div className="form-buttons">
          <button type="submit" className="submit-button">Submit</button>
          {userId && (
            <button
              type="button"
              className="delete-button"
              onClick={handleDelete}
            >
              Delete {formType.charAt(0).toUpperCase() + formType.slice(1)}
            </button>
          )}
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
  userId: PropTypes.string,
};

export default AddUserAdmin;