import Link from "next/link";
import styles from "./page.module.css";

interface Category {
  name: string;
  path: string;
  color: string;
}

export default function Home() {
  const categories: Category[] = [
    { name: "Music", path: "/music", color: "#FF6B6B" },
    { name: "Games", path: "/games", color: "#4ECDC4" },
    { name: "Movies", path: "/movies", color: "#45B7D1" },
    { name: "Shows", path: "/shows", color: "#96CEB4" },
    { name: "Activities", path: "/activities", color: "#FFEEAD" },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>What are you looking for today?</h1>
      <div className={styles.grid}>
        {categories.map((category) => (
          <Link
            href={category.path}
            key={category.name}
            className={styles.gridLink} // Add this class
          >
            <div
              className={styles.card}
              style={{ backgroundColor: category.color }}
              data-category={category.name}
            >
              <h2>{category.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
