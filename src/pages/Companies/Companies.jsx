import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputMask from "react-input-mask";
import styles from "./Companies.module.css";
import Menu from "../../components/Menu/Menu";

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const validateCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]+/g, "");
  if (cnpj.length !== 14) return false;
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  let digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
};

const Companies = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    rua: "",
    numero: "",
    bairro: "",
    estado: "",
    cep: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "numero") {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.cnpj) {
      setErrorMessage("Por favor, preencha os campos obrigatórios (Nome e CNPJ).");
      return;
    }
    if (!validateCNPJ(formData.cnpj)) {
      setErrorMessage("CNPJ inválido.");
      return;
    }
    if (formData.cep && formData.cep.replace(/[^\d]+/g, "").length !== 8) {
      setErrorMessage("CEP deve ter exatamente 8 dígitos.");
      return;
    }
    const companies = JSON.parse(localStorage.getItem("companies") || "[]");
    const cleanedCNPJ = formData.cnpj.replace(/[^\d]+/g, "");
    const cleanedCEP = formData.cep.replace(/[^\d]+/g, "");
    localStorage.setItem(
      "companies",
      JSON.stringify([
        ...companies,
        { ...formData, cnpj: cleanedCNPJ, cep: cleanedCEP, id: companies.length + 1 },
      ])
    );
    setSuccessMessage("Empresa cadastrada com sucesso!");
    setErrorMessage("");
    setFormData({
      nome: "",
      cnpj: "",
      rua: "",
      numero: "",
      bairro: "",
      estado: "",
      cep: "",
    });
  };

  const handleNavigate = () => {
    navigate("/companies-list");
  };

  return (
    <div className={styles.container}>
      <Menu />

      <div className={styles.card}>
        <h2 className={styles.title}>Cadastro de Empresas</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="nome">
            Nome da empresa:
          </label>
          <input
            className={styles.input}
            id="nome"
            name="nome"
            type="text"
            placeholder="Digite o nome da empresa"
            value={formData.nome}
            onChange={handleChange}
            required
          />

          <label className={styles.label} htmlFor="cnpj">
            CNPJ da empresa:
          </label>
          <InputMask
            mask="99.999.999/9999-99"
            value={formData.cnpj}
            onChange={handleChange}
            name="cnpj"
            required
          >
            {(inputProps) => (
              <input
                {...inputProps}
                className={styles.input}
                id="cnpj"
                placeholder="Digite o CNPJ (ex: 12.345.678/0001-95)"
              />
            )}
          </InputMask>

          <h3 className={styles.subTitle}>Endereço</h3>

          <label className={styles.label} htmlFor="rua">
            Rua:
          </label>
          <input
            className={styles.input}
            id="rua"
            name="rua"
            type="text"
            placeholder="Digite a rua"
            value={formData.rua}
            onChange={handleChange}
          />

          <label className={styles.label} htmlFor="numero">
            Número:
          </label>
          <input
            className={styles.input}
            id="numero"
            name="numero"
            type="text"
            placeholder="Digite o número"
            value={formData.numero}
            onChange={handleChange}
            maxLength="10"
          />

          <label className={styles.label} htmlFor="bairro">
            Bairro:
          </label>
          <input
            className={styles.input}
            id="bairro"
            name="bairro"
            type="text"
            placeholder="Digite o bairro"
            value={formData.bairro}
            onChange={handleChange}
          />

          <label className={styles.label} htmlFor="estado">
            Estado:
          </label>
          <select
            className={styles.select}
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
          >
            <option value="" disabled>
              Selecione um estado
            </option>
            {brazilianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <label className={styles.label} htmlFor="cep">
            CEP:
          </label>
          <InputMask
            mask="99999-999"
            value={formData.cep}
            onChange={handleChange}
            name="cep"
          >
            {(inputProps) => (
              <input
                {...inputProps}
                className={styles.input}
                id="cep"
                placeholder="Digite o CEP (ex: 12345-678)"
              />
            )}
          </InputMask>

          <button type="submit" className={styles.button}>
            Cadastrar
          </button>
        </form>

        {successMessage && (
          <p className={styles.successMessage}>{successMessage}</p>
        )}
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <button className={styles.secondaryButton} onClick={handleNavigate}>
          Listar empresas cadastradas
        </button>
      </div>
    </div>
  );
};

export default Companies;