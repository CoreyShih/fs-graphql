import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { ALL_AUTHORS, EDIT_BIRTH_YEAR } from "../queries";

const BirthYear = ({ authors, setError }) => {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");

  const [editBirthYear] = useMutation(EDIT_BIRTH_YEAR, {
    update: (cache, { data }) => {
      cache.updateQuery({ query: ALL_AUTHORS }, ({ allAuthors }) => ({
        allAuthors: allAuthors.map((a) =>
          a.id === data.editAuthor.id ? data.editAuthor : a,
        ),
      }));
    },
    onError: (error) => setError(error.message),
  });

  const handleUpdate = (event) => {
    event.preventDefault();

    editBirthYear({ variables: { name, year: +year } });

    setName("");
    setYear("");
  };

  if (!authors) return null;

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={handleUpdate}>
        <div>
          <label>
            name
            <select
              required
              name="name"
              value={name}
              onChange={({ target }) => setName(target.value)}
            >
              <option value="">-- Choose an author --</option>
              {authors.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            born
            <input
              type="number"
              value={year}
              onChange={({ target }) => setYear(target.value)}
            />
          </label>
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default BirthYear;
