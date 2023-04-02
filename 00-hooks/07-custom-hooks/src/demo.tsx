import React from "react";
import { useDebounce } from 'use-debounce';

export const MyComponent = () => {
  const [filter, setFilter] = React.useState("");
  const [userCollection, setUserCollection] = React.useState([]);
  const [debouncedFilter] =   useDebounce(filter, 500);
  // Load full list when the component gets mounted and filter gets updated
  React.useEffect(() => {
    fetch(`https://jsonplaceholder.typicode.com/users?name_like=${debouncedFilter}`)
      .then((response) => response.json())
      .then((json) => setUserCollection(json));
  }, [debouncedFilter]);

  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <ul>
        {userCollection.map((user, index) => (
          <li key={index}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};
