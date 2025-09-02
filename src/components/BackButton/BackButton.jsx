import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import styles from './BackButton.module.css';

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={styles.backButton}
      onClick={() => navigate(-1)}
      aria-label="Voltar"
    >
      <FaArrowLeft size="1.2em" />
    </button>
  );
}

