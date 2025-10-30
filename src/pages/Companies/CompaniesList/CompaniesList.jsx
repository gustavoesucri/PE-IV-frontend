import React, { useState, useEffect } from "react";
import InputMask from "react-input-mask";
import styles from "./CompaniesList.module.css";
import Menu from "../../../components/Menu/Menu";

const mockCompanies = [
  {
    id: 1,
    nome: "Empresa ABC Ltda",
    cnpj: "12345678000195",
    rua: "Rua Principal",
    numero: "123",
    bairro: "Centro",
    estado: "SP",
    cep: "12345678",
  },
  {
    id: 2,
    nome: "XYZ Soluções",
    cnpj: "98765432000176",
    rua: "Avenida Brasil",
    numero: "456",
    bairro: "Jardim",
    estado: "RJ",
    cep: "87654321",
  },
];

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

const CompaniesList = () => {
  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem("companies");
    return saved ? JSON.parse(saved) : mockCompanies;
  });
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState(companies);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    rua: "",
    numero: "",
    bairro: "",
    estado: "",
    cep: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [cnpjFilter, setCnpjFilter] = useState("");


  useEffect(() => {
    const savedCompanies = JSON.parse(localStorage.getItem("companies") || "[]");
    setCompanies(savedCompanies.length > 0 ? savedCompanies : mockCompanies);
    setFilteredCompanies(savedCompanies.length > 0 ? savedCompanies : mockCompanies);
  }, []);

  useEffect(() => {
    localStorage.setItem("companies", JSON.stringify(companies));
  }, [companies]);

  const handleFilter = () => {
    const normalize = (value) => value.replace(/[^\d]+/g, "");

    let results = companies;

    if (search) {
      results = results.filter((c) =>
        c.nome.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (cnpjFilter) {
      results = results.filter((c) =>
        normalize(c.cnpj).includes(normalize(cnpjFilter))
      );
    }

    if (stateFilter) {
      results = results.filter((c) => c.estado === stateFilter);
    }

    setFilteredCompanies(results);
  };

  const handleEditClick = (company) => {
    setEditingCompany(company);
    setFormData({ ...company });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
    setFormData({
      nome: "",
      cnpj: "",
      rua: "",
      numero: "",
      bairro: "",
      estado: "",
      cep: "",
    });
    setErrorMessage("");
  };

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

  const handleSave = () => {
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
    const cleanedCNPJ = formData.cnpj.replace(/[^\d]+/g, "");
    const cleanedCEP = formData.cep.replace(/[^\d]+/g, "");
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === editingCompany.id
          ? { ...formData, cnpj: cleanedCNPJ, cep: cleanedCEP, id: c.id }
          : c
      )
    );
    setFilteredCompanies((prev) =>
      prev.map((c) =>
        c.id === editingCompany.id
          ? { ...formData, cnpj: cleanedCNPJ, cep: cleanedCEP, id: c.id }
          : c
      )
    );
    handleCloseModal();
  };

  const formatCNPJ = (cnpj) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  return (
    <div className={styles.container}>
      <Menu />
      <h1 className={styles.title}>Lista de Empresas</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.input}
        />

        <input
          type="text"
          placeholder="Buscar por CNPJ..."
          value={cnpjFilter}
          onChange={(e) => setCnpjFilter(e.target.value)}
          className={styles.input}
        />

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">Todos os estados</option>
          {brazilianStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        <button onClick={handleFilter} className={styles.filterButton}>
          Filtrar
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CNPJ</th>
              <th>Estado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <tr key={company.id}>
                  <td>{company.nome}</td>
                  <td>{formatCNPJ(company.cnpj)}</td>
                  <td>{company.estado}</td>
                  <td>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleEditClick(company)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.noData}>
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && editingCompany && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Editar Empresa</h2>
              <button className={styles.modalClose} onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <div className={styles.modalContent}>
              <label className={styles.label} htmlFor="nome">
                Nome da empresa:
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Digite o nome da empresa"
                className={styles.input}
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

              <label className={styles.label} htmlFor="rua">
                Rua:
              </label>
              <input
                type="text"
                name="rua"
                value={formData.rua}
                onChange={handleChange}
                placeholder="Digite a rua"
                className={styles.input}
              />

              <label className={styles.label} htmlFor="numero">
                Número:
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                placeholder="Digite o número"
                className={styles.input}
                maxLength="10"
              />

              <label className={styles.label} htmlFor="bairro">
                Bairro:
              </label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                placeholder="Digite o bairro"
                className={styles.input}
              />

              <label className={styles.label} htmlFor="estado">
                Estado:
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className={styles.select}
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

              {errorMessage && (
                <p className={styles.errorMessage}>{errorMessage}</p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button onClick={handleSave} className={styles.filterButton}>
                Salvar
              </button>
              <button onClick={handleCloseModal} className={styles.filterButton}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesList;