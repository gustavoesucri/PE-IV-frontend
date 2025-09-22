import React from "react";
import styles from "./Companies.module.css";
import Menu from "../../components/Menu/Menu";

const Companies = () => {

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Empresa cadastrada com sucesso!");
    };

    return (
        <div className={styles.container}>
        <Menu />

            <h1 className={styles.pageTitle}>Sistema de Gestão de Alunos</h1>

            <div className={styles.card}>
                <h2 className={styles.title}>Cadastro de Empresas</h2>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <TextInput label="Nome da empresa" id="nome" type="text" />
                    <TextInput label="CNPJ da empresa" id="cnpj-empresa" type="number" />

                    <h3 className={styles.subTitle}>Endereço</h3>

                    <div className={styles.endereco}>
                        <TextInput label="Rua" id="rua" type="text" />
                        <TextInput label="Número" id="numero" type="number" />
                        <TextInput label="Bairro" id="bairro" type="text" />
                        <TextInput label="Estado" id="estado" type="text" />
                        <TextInput label="CEP" id="cep" type="text" />
                    </div>

                    <button type="submit" className={styles.button}>
                        Cadastrar
                    </button>
                </form>
            </div>
        </div>
    );
};

// Componente de input reutilizável
const TextInput = ({ label, id, type }) => (
    <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor={id}>{label}:</label>
        <input className={styles.input} id={id} name={id} type={type} required />
    </div>
);

export default Companies;
