import React, { useState, useEffect } from 'react';
import axios from 'axios';


export default props => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.post('http://localhost:8000/api/get_user')
    .then(response => {
      console.log("the response:")
      console.log(response);
      setUsers(response.data);
      console.log("user:");
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    })
  }, []);

  console.log(users.length)

  return (
    <div>
      {
        (users
          ? users.map((user, idx) => {
            return (
              <div key={idx}>
                <h1>{user.username}</h1>
                <span>{user.created_at}</span>
              </div>
            )
          })
          : <h1>No data</h1>
        )
      }
    </div>
  )
}
