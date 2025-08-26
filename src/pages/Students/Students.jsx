import React from "react";
import styles from "./Students.module.css"
import BackButton from "../../components/BackButton/BackButton";
// import Button from "../../components/Button/Button.jsx"

const Students = () => {
    return (
        
        <div className={styles.container}>
            <BackButton />
            <h1 className={styles.title}>{"Página de Cadastro de Alunos"}</h1>
            <div className={styles.form}>
            <label className={styles.label} htmlFor="nome">{"Nome do aluno(a):"}</label>
            <input className={styles.input} id="nome" name="nome" type="text" />
            <label className={styles.label} htmlFor="id-aluno">{"ID do aluno(a):"}</label>
            <input className={styles.input} id="id-aluno" name="id-aluno" type="number" />
            <button className={styles.button} type="submit">Cadastrar</button>
            </div>
        </div>
    );
};

export default Students;