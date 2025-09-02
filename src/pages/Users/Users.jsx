import React, { useState } from 'react';
import Modal from 'react-modal';
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
} from '@mui/material';
import styles from './Users.module.css';
import BackButton from '../../components/BackButton/BackButton';
import { FaTimes } from 'react-icons/fa';

Modal.setAppElement('#root');

const Users = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState([
    'Professor',
    'Psicólogo',
    'Diretor',
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleNewCategoryChange = (event) => {
    setNewCategory(event.target.value);
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
      setTimeout(() => setIsSuccessModalOpen(false), 1500);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert('Administrador cadastrado com sucesso!');
    setUsername('');
    setPassword('');
    setCategory('');
  };

  return (
    <div className={styles.container}>
              <BackButton />
      <h1 className={styles.pageTitle}>Sistema de Gestão de Alunos</h1>
      <div className={styles.card}>
        <h2 className={styles.title}>Cadastro de Administrador</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label="Nome de Usuário"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Senha"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Categoria</InputLabel>
            <Select
              value={category}
              onChange={handleCategoryChange}
              required
            >
              {categories.map((cat, index) => (
                <MenuItem key={index} value={cat}>
                  {cat}
                </MenuItem>
              ))}
              <MenuItem onClick={() => setIsModalOpen(true)}>+ Nova</MenuItem>
            </Select>
          </FormControl>

          <button type="submit" className={styles.btn_users}>
            Cadastrar
          </button>
        </form>
      </div>

      {/* Modal para adicionar nova categoria */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Adicionar Nova Categoria"
        className={styles.modal}
        overlayClassName={styles.overlay}
        closeTimeoutMS={200}
      >
        <div className={styles.modalContent}>
          <button
            className={styles.closeButton}
            onClick={() => setIsModalOpen(false)}
          >
            <FaTimes />
          </button>
          <h2>Nova Categoria</h2>
          <TextField
            label="Nome da Categoria"
            variant="outlined"
            value={newCategory}
            onChange={handleNewCategoryChange}
            fullWidth
            margin="normal"
          />
          <Button
            onClick={handleAddCategory}
            variant="contained"
            color="primary"
          >
            Adicionar
          </Button>
        </div>
      </Modal>

      {/* Modal de sucesso */}
      <Modal
        isOpen={isSuccessModalOpen}
        onRequestClose={() => setIsSuccessModalOpen(false)}
        contentLabel="Categoria Adicionada"
        className={styles.successModal}
        overlayClassName={styles.overlay}
        closeTimeoutMS={200}
      >
        <div className={styles.successContent}>
          <p>Categoria adicionada com sucesso!</p>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
