import React from "react";
import { Link } from "react-router-dom";
import { NotebookPen } from "lucide-react";
import styles from "./StudentsList.module.css";
import BackButton from "../../components/BackButton/BackButton";

const students = [
  "Ana Maria Silva Souza",
  "Bruno Henrique Costa Lima",
  "Carlos Eduardo Ferreira Santos",
  "Diana Beatriz Oliveira Rocha"
];

const StudentsList = () => {
  return (
    <div className={styles.container}>
      <BackButton />
      <h1 className={styles.title}>Lista de alunos</h1>
      {students.map((student, index) => (
        <div key={index} className={styles.alumn}>
          {student}
          <Link
            to={`/edit-student/${encodeURIComponent(student)}`}
            className={styles.editIcon}
            title={`Editar ${student}`}
          >
            <NotebookPen />
          </Link>
        </div>
      ))}
    </div>
  );
};

export default StudentsList;
