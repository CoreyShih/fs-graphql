import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { ALL_BOOKS, BOOKS_BY_GENRE } from "../queries";

const Books = ({ show }) => {
  const [genre, setGenre] = useState(null);
  const allResult = useQuery(ALL_BOOKS);
  const genreResult = useQuery(BOOKS_BY_GENRE, {
    variables: { genre },
    fetchPolicy: "network-only",
  });

  if (!show) return null;
  if (allResult.loading || genreResult.loading) return <div>loading...</div>;
  if (allResult.error) return <div>error: {allResult.error.message}</div>;
  if (genreResult.error) return <div>error: {genreResult.error.message}</div>;

  const allGenres = allResult.data.allBooks.reduce((acc, book) => {
    book.genres.forEach((book) => acc.add(book));
    return acc;
  }, new Set());

  const books = genreResult.data.allBooks;

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {[...allGenres].map((g) => (
          <button key={g} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
        <button onClick={() => setGenre(null)}>all genres</button>
      </div>
    </div>
  );
};

export default Books;
