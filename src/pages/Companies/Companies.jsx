import React from "react";
import styles from "./Companies.module.css"
import BackButton from "../../components/BackButton/BackButton";
// import Button from "../../components/Button/Button.jsx"

const Companies = () => {
    return (
        <div className={styles.container}>
            <BackButton />
            <h1 className={styles.title}>{"Página de Cadastro de Empresas"}</h1>
            <div className={styles.form}>
            <label className={styles.label} htmlFor="nome">{"Nome da empresa:"}</label>
            <input className={styles.inputNome} id="nome" name="nome" type="text" />
            <label className={styles.label} htmlFor="cnpj-empresa">{"CNPJ da empresa:"}</label>
            <input className={styles.inputCnpj} id="cnpj-empresa" name="cnpj-empresa" type="number" />

            <h2>Endereço</h2>
            <div className={styles.endereco}>

            <div>
            <label className={styles.label} htmlFor="rua">{"Rua:"}</label>
            <input className={styles.inputRua} id="rua" name="rua" type="text" />
            </div>

            <div>
            <label className={styles.label} htmlFor="numero">{"Número:"}</label>
            <input className={styles.inputNumero} id="numero" name="numero" type="number" />
            </div>
            

            <div>
            <label className={styles.label} htmlFor="bairro">{"Bairro:"}</label>
            <input className={styles.inputBairro} id="bairro" name="bairro" type="text" />
            </div>

            <div className="estado">
            <label className={styles.label} htmlFor="estado">{"Estado:"}</label>
            <input className={styles.inputEstado} id="estado" name="estado" type="text" />
            </div>

            <div>
            <label className={styles.label} htmlFor="cep">{"CEP:"}</label>
            <input className={styles.inputCep} id="cep" name="cep" type="text" />
            </div>

            </div>
            <button className={styles.button} type="submit">Cadastrar</button>
            </div>
        </div>
    );
};

export default Companies;