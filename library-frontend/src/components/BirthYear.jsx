import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { ALL_AUTHORS, EDIT_BIRTH_YEAR } from "../queries";

const BirthYear = () => {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");

  const [editBirthYear] = useMutation(EDIT_BIRTH_YEAR, {
    refetchQueries: [ALL_AUTHORS],
    onError: (error) => console.error(error.message),
  });

  const handleUpdate = (event) => {
    event.preventDefault();

    editBirthYear({ variables: { name, year: +year } });

    setName("");
    setYear("");
  };

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={handleUpdate}>
        <div>
          <label>
            name
            <input
              value={name}
              onChange={({ target }) => setName(target.value)}
            />
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
