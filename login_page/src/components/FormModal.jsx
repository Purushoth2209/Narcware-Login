import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { db, auth } from "../firebase"; // Import auth for Firebase Authentication
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  deleteField,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "./styles/FormModal.css";

const FormModal = ({ type, table, data, onClose }) => {
  const [formData, setFormData] = useState(data || {});
  const [columns, setColumns] = useState([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("both");
  const [manageMode, setManageMode] = useState(false);
  const [operation, setOperation] = useState("add"); // "add" or "delete"
  const [selectedFieldToDelete, setSelectedFieldToDelete] = useState("");

  const fetchColumns = async () => {
    const querySnapshot = await getDocs(collection(db, table));
    if (!querySnapshot.empty) {
      const sampleDoc = querySnapshot.docs[0].data();
      setColumns(Object.keys(sampleDoc));
    }
  };

  useEffect(() => {
    fetchColumns();
  }, [table]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (type === "add") {
      // Add user/admin to Firebase Authentication
      const { email, password, ...otherData } = formData;

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const userId = userCredential.user.uid;

        // Save user/admin data to Firestore
        await addDoc(collection(db, table), {
          ...otherData,
          email,
          userId,
        });

        alert(`${table.slice(0, -1)} added successfully!`);
      } catch (error) {
        console.error("Error adding user/admin:", error.message);
        alert("Failed to add user/admin.");
      }
    } else if (type === "edit" && data) {
      const docRef = doc(db, table, data.id);
      await updateDoc(docRef, formData);
      alert("Updated successfully!");
    }
    onClose();
  };

  const handleAddField = async (e) => {
    e.preventDefault();
    if (!newFieldName) {
      alert("Please enter a field name.");
      return;
    }

    try {
      // Add the new field to Firestore
      const colRef = collection(db, table);
      const docSnapshot = await getDocs(colRef);
      const firstDocId = docSnapshot.docs[0].id;
      const docRef = doc(db, table, firstDocId);

      await updateDoc(docRef, {
        [newFieldName]: newFieldType,
      });

      alert("Field added successfully!");
      setColumns((prevColumns) => [...prevColumns, newFieldName]);
      setNewFieldName("");
      setNewFieldType("both");
    } catch (error) {
      console.error("Error adding field:", error.message);
      alert("Failed to add the field.");
    }
  };

  const handleDeleteField = async () => {
    if (!selectedFieldToDelete) {
      alert("Please select a field to delete.");
      return;
    }

    try {
      const querySnapshot = await getDocs(collection(db, table));

      // Delete the selected field from all documents
      querySnapshot.forEach(async (docItem) => {
        const docRef = doc(db, table, docItem.id);
        await updateDoc(docRef, {
          [selectedFieldToDelete]: deleteField(),
        });
      });

      alert("Field deleted successfully!");
      setColumns((prevColumns) =>
        prevColumns.filter((col) => col !== selectedFieldToDelete)
      );
      setSelectedFieldToDelete("");
    } catch (error) {
      console.error("Error deleting field:", error.message);
      alert("Failed to delete the field.");
    }
  };

  return (
    <div className="modal">
      <form onSubmit={manageMode ? undefined : handleSubmit}>
        <h2>{manageMode ? "Manage Fields" : `${type === "add" ? "Add" : "Edit"} ${table.slice(0, -1)}`}</h2>

        {manageMode ? (
          <>
            <div>
              <label>Operation</label>
              <select value={operation} onChange={(e) => setOperation(e.target.value)}>
                <option value="add">Add Field</option>
                <option value="delete">Delete Field</option>
              </select>
            </div>

            {operation === "add" && (
              <>
                <div>
                  <label>Field Name</label>
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Field Type</label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value)}
                  >
                    <option value="both">Both</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <button type="button" onClick={handleAddField}>
                  Add Field
                </button>
              </>
            )}

            {operation === "delete" && (
              <>
                <div>
                  <label>Select Field to Delete</label>
                  <select
                    value={selectedFieldToDelete}
                    onChange={(e) => setSelectedFieldToDelete(e.target.value)}
                  >
                    <option value="">--Select Field--</option>
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={handleDeleteField}>
                  Delete Field
                </button>
              </>
            )}
            <button onClick={() => setManageMode(false)}>Back to Form</button>
          </>
        ) : (
          <>
            <div>
              <label>Email</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            {type === "add" && (
              <div>
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
            )}
            {columns.map((key) => (
              <div key={key}>
                <label>{key}</label>
                <input
                  type="text"
                  value={formData[key] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                />
              </div>
            ))}
            <button type="submit">Save</button>
            <button type="button" onClick={() => setManageMode(true)}>
              Manage Fields
            </button>
          </>
        )}
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

FormModal.propTypes = {
  type: PropTypes.oneOf(["add", "edit"]).isRequired,
  table: PropTypes.string.isRequired,
  data: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default FormModal;
