import { useQuery, skipToken } from "@apollo/client/react";
import { BOOKS_BY_GENRE, FAVORITE_GENRE } from "../queries";

const Recommendations = ({ show, token }) => {
  const genreResult = useQuery(FAVORITE_GENRE, token ? {} : skipToken);
  const favoriteGenre = genreResult?.data?.me?.favoriteGenre;

  const booksResult = useQuery(
    BOOKS_BY_GENRE,
    favoriteGenre
      ? {
          variables: { genre: favoriteGenre },
        }
      : skipToken,
  );

  if (!show || !token) return null;
  if (genreResult.loading || booksResult.loading) return <div>loading...</div>;
  if (genreResult.error) return <div>error: {genreResult.error.message}</div>;
  if (booksResult.error) return <div>error: {booksResult.error.message}</div>;

  const books = booksResult.data.allBooks;

  return (
    <div>
      <h2>recommendations</h2>
      books in your favorite genre <strong>{favoriteGenre}</strong>
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
    </div>
  );
};

export default Recommendations;
