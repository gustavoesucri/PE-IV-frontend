import { useState } from "react";
import styles from "./Control.module.css";
import Menu from "../../components/Menu/Menu";

const mockControls = [
  {
    id: 1,
    nome: "Rodrigo Martins",
    ingresso: "2024-03-10",
    avaliacao1: "2024-04-15",
    avaliacao2: "2024-06-20",
    entrevista1: "2024-07-05",
    entrevista2: "2024-07-25",
    resultado: "2024-08-01",
  },
  {
    id: 2,
    nome: "Maria Silva",
    ingresso: "2024-05-22",
    avaliacao1: "2024-06-15",
    avaliacao2: "2024-09-10",
    entrevista1: "2024-09-20",
    entrevista2: "2024-10-05",
    resultado: "2024-11-01",
  },
];

const Control = () => {
  const [search, setSearch] = useState("");
  const [dateType, setDateType] = useState("ingresso");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filtered, setFiltered] = useState(mockControls);

  const handleFilter = () => {
    let results = mockControls.filter((p) =>
      p.nome.toLowerCase().includes(search.toLowerCase())
    );

    if (dateFrom || dateTo) {
      results = results.filter((p) => {
        const dateValue = new Date(p[dateType]);
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;

        if (from && dateValue < from) return false;
        if (to && dateValue > to) return false;
        return true;
      });
    }

    setFiltered(results);
  };

  const handleView = (id) => {
    alert(`Visualizar registro ID: ${id}`);
  };

  return (
    <div className={styles.container}>
        <Menu />

      <h1 className={styles.title}>Controle de Alunos</h1>

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
          <option value="ingresso">Ingresso</option>
          <option value="avaliacao1">Avaliação</option>
          <option value="avaliacao2">Avaliação 2</option>
          <option value="entrevista1">Entrevista Pais 1</option>
          <option value="entrevista2">Entrevista Pais 2</option>
          <option value="resultado">Resultado</option>
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
              <th>Ingresso</th>
              <th>Avaliação</th>
              <th>Avaliação 2</th>
              <th>Entrevista Pais 1</th>
              <th>Entrevista Pais 2</th>
              <th>Resultado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td>{p.ingresso}</td>
                  <td>{p.avaliacao1}</td>
                  <td>{p.avaliacao2}</td>
                  <td>{p.entrevista1}</td>
                  <td>{p.entrevista2}</td>
                  <td>{p.resultado}</td>
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
                <td colSpan="8" className={styles.noData}>
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

export default Control;
