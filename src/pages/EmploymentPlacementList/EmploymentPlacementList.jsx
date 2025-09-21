import { useState } from "react";
import styles from "./EmploymentPlacementList.module.css";
import BackButton from "../../components/BackButton/BackButton";

const mockPlacements = [
  { 
    id: 1,
    nome: "Rodrigo Martins",
    admissao: "2024-03-10",
    empresa: "Tech Solutions",
    funcao: "Desenvolvedor",
    contatoRh: "Ana Pereira",
    desligamento: "2025-01-15"
  },
  { 
    id: 2,
    nome: "Maria Silva",
    admissao: "2024-05-22",
    empresa: "Inova Ltda",
    funcao: "Analista",
    contatoRh: "Carlos Oliveira",
    desligamento: "2025-06-30"
  },
  { 
    id: 3,
    nome: "João Souza",
    admissao: "2024-06-15",
    empresa: "StartUpX",
    funcao: "Estagiário",
    contatoRh: "Fernanda Costa",
    desligamento: "2025-04-10"
  }
];

const EmploymentPlacementList = () => {
  const [search, setSearch] = useState("");
  const [dateType, setDateType] = useState("admissao");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filteredPlacements, setFilteredPlacements] = useState(mockPlacements);

  const handleFilter = () => {
    let results = mockPlacements.filter(p =>
      p.nome.toLowerCase().includes(search.toLowerCase())
    );

    if (dateFrom || dateTo) {
      results = results.filter(p => {
        const dateValue = new Date(p[dateType]);
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;

        if (from && dateValue < from) return false;
        if (to && dateValue > to) return false;
        return true;
      });
    }

    setFilteredPlacements(results);
  };

  const handleView = (id) => {
    alert(`Visualizar registro ID: ${id}`);
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <h1 className={styles.title}>Lista de Encaminhamentos</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.input}
        />

        <select
          value={dateType}
          onChange={(e) => setDateType(e.target.value)}
          className={styles.input}
        >
          <option value="admissao">Data de Admissão</option>
          <option value="desligamento">Data de Desligamento</option>
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className={styles.input}
        />
        <span className={styles.rangeSeparator}>até</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className={styles.input}
        />

        <button onClick={handleFilter} className={styles.filterButton}>
          Filtrar
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Data Admissão</th>
              <th>Empresa</th>
              <th>Função</th>
              <th>Contato RH</th>
              <th>Provável Desligamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlacements.length > 0 ? (
              filteredPlacements.map(p => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td>{p.admissao}</td>
                  <td>{p.empresa}</td>
                  <td>{p.funcao}</td>
                  <td>{p.contatoRh}</td>
                  <td>{p.desligamento}</td>
                  <td>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleView(p.id)}
                    >
                      Visualizar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className={styles.noData}>
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmploymentPlacementList;
